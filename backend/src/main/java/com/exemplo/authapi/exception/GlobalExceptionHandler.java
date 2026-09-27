package com.exemplo.authapi.exception;

import com.exemplo.authapi.dto.ErroResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Converte exceções em respostas JSON com o status HTTP correto. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** E-mail ou senha errados → 401 (mensagem genérica de propósito). */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErroResponse> handleAuthentication(AuthenticationException e) {
        return erro(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
    }

    /** Campos obrigatórios vazios ou e-mail malformado → 400. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> handleValidation(MethodArgumentNotValidException e) {
        String mensagem = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("Requisição inválida");

        return erro(HttpStatus.BAD_REQUEST, mensagem);
    }

    /** Corpo ausente ou JSON inválido → 400. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponse> handleBodyInvalido(HttpMessageNotReadableException e) {
        return erro(HttpStatus.BAD_REQUEST, "Corpo da requisição inválido");
    }

    private ResponseEntity<ErroResponse> erro(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(new ErroResponse(status.value(), mensagem));
    }
}
