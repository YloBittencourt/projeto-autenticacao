package com.exemplo.authapi.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** Rota protegida: só responde se a requisição trouxer um JWT válido. */
@RestController
public class UsuarioController {

    @GetMapping("/api/me")
    public Map<String, Object> me(Authentication authentication) {
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return Map.of(
                "email", authentication.getName(),
                "roles", roles,
                "mensagem", "Você está autenticado como: " + authentication.getName()
        );
    }
}
