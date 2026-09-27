package com.exemplo.authapi.dto;

/**
 * Resposta do login: o Access Token e como usá-lo.
 *
 * @param token     JWT assinado pelo servidor
 * @param tokenType sempre "Bearer" (formato do header Authorization)
 * @param expiresIn validade do token em segundos
 */
public record LoginResponse(
        String token,
        String tokenType,
        long expiresIn
) {
}
