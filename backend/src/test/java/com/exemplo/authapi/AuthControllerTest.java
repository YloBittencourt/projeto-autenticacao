package com.exemplo.authapi;

import com.exemplo.authapi.service.JwtService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração do fluxo completo:
 * login → recebe JWT → acessa rota protegida enviando o token.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Value("${jwt.secret}")
    private String secret;

    private String login(String email, String senha) throws Exception {
        String body = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"senha\":\"%s\"}".formatted(email, senha)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return JsonPath.read(body, "$.token");
    }

    @Test
    void loginComCredenciaisValidasRetornaToken() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"aluno@email.com\",\"senha\":\"123456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(3600));
    }

    @Test
    void loginComSenhaErradaRetorna401() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"aluno@email.com\",\"senha\":\"errada\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro").value("E-mail ou senha inválidos"));
    }

    @Test
    void loginComUsuarioInexistenteRetorna401() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ninguem@email.com\",\"senha\":\"123456\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginComDadosInvalidosRetorna400() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nao-e-email\",\"senha\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro", not(emptyString())));
    }

    @Test
    void rotaProtegidaSemTokenRetorna401() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro").value("Token ausente, inválido ou expirado"));
    }

    @Test
    void rotaProtegidaComTokenValidoRetornaUsuario() throws Exception {
        String token = login("aluno@email.com", "123456");

        mockMvc.perform(get("/api/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("aluno@email.com"))
                .andExpect(jsonPath("$.roles", contains("ROLE_USER")));
    }

    @Test
    void rotaProtegidaComTokenAdulteradoRetorna401() throws Exception {
        String token = login("aluno@email.com", "123456");
        String adulterado = token.substring(0, token.length() - 2) + "xx";

        mockMvc.perform(get("/api/me")
                        .header("Authorization", "Bearer " + adulterado))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rotaProtegidaComTokenExpiradoRetorna401() throws Exception {
        String expirado = new JwtService(secret, -1000)
                .generateToken("aluno@email.com", List.of("ROLE_USER"));

        mockMvc.perform(get("/api/me")
                        .header("Authorization", "Bearer " + expirado))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rotaPublicaNaoExigeToken() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk());
    }
}
