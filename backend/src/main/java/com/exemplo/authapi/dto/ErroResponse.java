package com.exemplo.authapi.dto;

public record ErroResponse(
        int status,
        String erro
) {
}
