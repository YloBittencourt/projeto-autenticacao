package com.exemplo.authapi.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuarioController {

    @GetMapping("/api/me")
    public String me(Authentication authentication) {
        return "Você está autenticado como: " + authentication.getName();
    }
}
