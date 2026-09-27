import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080';

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/auth/login`,
        {
          email,
          senha
        }
      )
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.token);
        })
      );
  }
  
  testarRotaProtegida(): Observable<string> {
     return this.http.get(`${this.apiUrl}/api/me`, {
        responseType: 'text'
      });
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }
}
