package com.exemplo.authapi.service;

import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET = "chave-de-teste-com-pelo-menos-32-bytes-ok";

    private final JwtService jwtService = new JwtService(SECRET, 60_000);

    @Test
    void geraTokenComEmailERoles() {
        String token = jwtService.generateToken("aluno@email.com", List.of("ROLE_USER"));

        assertEquals(3, token.split("\\.").length, "JWT deve ter header.payload.assinatura");
        String header = new String(Base64.getUrlDecoder().decode(token.split("\\.")[0]));
        assertTrue(header.contains("\"alg\":\"HS256\""), "Token deve ser assinado com HS256");
        assertTrue(jwtService.isTokenValid(token));
        assertEquals("aluno@email.com", jwtService.extractEmail(token).orElseThrow());
        assertEquals(List.of("ROLE_USER"), jwtService.parseToken(token).orElseThrow().get("roles"));
    }

    @Test
    void tokenExpiradoEhInvalido() {
        JwtService expirado = new JwtService(SECRET, -1000);
        String token = expirado.generateToken("aluno@email.com", List.of());

        assertFalse(jwtService.isTokenValid(token));
    }

    @Test
    void tokenAssinadoComOutraChaveEhInvalido() {
        JwtService outraChave = new JwtService("outra-chave-secreta-com-mais-de-32-bytes", 60_000);
        String token = outraChave.generateToken("aluno@email.com", List.of());

        assertFalse(jwtService.isTokenValid(token));
    }

    @Test
    void tokenMalformadoEhInvalido() {
        assertFalse(jwtService.isTokenValid("isto-nao-e-um-jwt"));
        assertFalse(jwtService.isTokenValid(""));
    }
}
