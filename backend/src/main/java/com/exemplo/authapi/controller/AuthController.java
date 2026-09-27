package com.exemplo.authapi.controller;

import com.exemplo.authapi.dto.LoginRequest;
import com.exemplo.authapi.dto.LoginResponse;
import com.exemplo.authapi.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /**
     * Único momento em que a senha trafega. Se as credenciais estiverem
     * corretas, devolve o JWT; se não, o AuthenticationManager lança
     * BadCredentialsException, convertida em 401 pelo GlobalExceptionHandler.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.senha()
                )
        );

        // Só os papéis (ROLE_*) vão para o token; o Spring Security 7 também
        // adiciona autoridades internas como FACTOR_PASSWORD, que não interessam aqui
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .toList();

        String token = jwtService.generateToken(authentication.getName(), roles);

        return ResponseEntity.ok(
                new LoginResponse(token, "Bearer", jwtService.getExpirationSeconds())
        );
    }
}
