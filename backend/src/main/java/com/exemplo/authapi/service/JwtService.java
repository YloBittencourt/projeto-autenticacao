package com.exemplo.authapi.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * Responsável por gerar e validar os JWTs (Access Tokens).
 *
 * O token é assinado com HMAC-SHA256 usando uma chave secreta que só o
 * servidor conhece. Qualquer alteração no token invalida a assinatura.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * Gera o token com o e-mail no "sub" (subject) e os papéis do usuário
     * na claim "roles". A senha NUNCA vai para o token.
     */
    public String generateToken(String email, List<String> roles) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("roles", roles)
                .issuedAt(agora)
                .expiration(expiracao)
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Valida assinatura e expiração. Retorna as claims se o token for válido,
     * ou vazio se estiver expirado, adulterado ou malformado.
     */
    public Optional<Claims> parseToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return Optional.of(claims);

        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public boolean isTokenValid(String token) {
        return parseToken(token).isPresent();
    }

    public Optional<String> extractEmail(String token) {
        return parseToken(token).map(Claims::getSubject);
    }

    /** Tempo de vida do token em segundos (informado ao cliente no login). */
    public long getExpirationSeconds() {
        return expirationMs / 1000;
    }
}
