import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { API_URL } from '../api.config';
import { AuthService } from './auth.service';

const LOGIN_URL = `${API_URL}/auth/login`;

/**
 * Anexa "Authorization: Bearer <token>" em toda chamada ao backend
 * (exceto o próprio login). Se o backend responder 401, o token expirou
 * ou é inválido: limpa a sessão e volta para a tela de login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const isApi = req.url.startsWith(API_URL);
  const isLogin = req.url === LOGIN_URL;
  const token = authService.getToken();

  const request = isApi && !isLogin && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isApi && !isLogin) {
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
