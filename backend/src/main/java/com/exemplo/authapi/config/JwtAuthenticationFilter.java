package com.exemplo.authapi.config;

import com.exemplo.authapi.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro executado uma vez por requisição.
 *
 * Lê o cabeçalho "Authorization: Bearer <token>", valida o JWT e, se estiver
 * tudo certo, registra o usuário no SecurityContext. Assim as rotas protegidas
 * sabem quem está chamando sem que a senha seja reenviada.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Sem token: segue o fluxo. Se a rota for protegida, o Spring
        // Security devolve 401 pelo AuthenticationEntryPoint.
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            jwtService.parseToken(token).ifPresent(claims -> {
                var authentication = new UsernamePasswordAuthenticationToken(
                        claims.getSubject(),
                        null,
                        extractAuthorities(claims)
                );
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }

        filterChain.doFilter(request, response);
    }

    private List<SimpleGrantedAuthority> extractAuthorities(Claims claims) {
        List<?> roles = claims.get("roles", List.class);

        if (roles == null) {
            return List.of();
        }

        return roles.stream()
                .map(String::valueOf)
                .map(SimpleGrantedAuthority::new)
                .toList();
    }
}
