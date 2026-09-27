package com.exemplo.authapi.dto;

public record LoginRequest(
        String email,
        String senha
) {
}
