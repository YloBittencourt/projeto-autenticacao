package com.exemplo.authapi.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key = Keys.hmacShaKeyFor(
            "chave-secreta-super-grande-para-o-nosso-jwt-2026"
                    .getBytes(StandardCharsets.UTF_8)
    );

    private final long expiration = 1000 * 60 * 60;

    public String generateToken(String email) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + expiration);

        return Jwts.builder()
                .subject(email)
                .issuedAt(agora)
                .expiration(expiracao)
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (Exception e) {
            return false;
        }
    }
}
