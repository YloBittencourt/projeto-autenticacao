import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../api.config';

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
}

export interface UsuarioLogado {
  email: string;
  roles: string[];
  mensagem: string;
}

const TOKEN_KEY = 'access_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  /**
   * Único momento em que a senha é enviada ao servidor.
   * O Access Token recebido fica guardado para as próximas requisições.
   */
  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}/auth/login`, { email, senha })
      .pipe(
        tap(response => localStorage.setItem(TOKEN_KEY, response.token))
      );
  }

  /** Rota protegida: o interceptor anexa o token automaticamente. */
  getMe(): Observable<UsuarioLogado> {
    return this.http.get<UsuarioLogado>(`${API_URL}/api/me`);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Data de expiração lida da claim "exp" do payload do JWT. */
  getTokenExpiration(): Date | null {
    const token = this.getToken();
    const exp = token ? this.decodePayload(token)?.['exp'] : null;

    return typeof exp === 'number' ? new Date(exp * 1000) : null;
  }

  /** Existe token e ele ainda não expirou. */
  isAuthenticated(): boolean {
    const expiracao = this.getTokenExpiration();

    return expiracao !== null && expiracao.getTime() > Date.now();
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Lê o payload (parte do meio) do JWT. Apenas decodifica Base64URL:
   * quem valida a assinatura é sempre o backend.
   */
  private decodePayload(token: string): Record<string, unknown> | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
      );

      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
