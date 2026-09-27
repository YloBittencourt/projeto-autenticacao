import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService, UsuarioLogado } from '../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [DatePipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = signal<UsuarioLogado | null>(null);
  mensagemErro = signal('');

  token = this.authService.getToken() ?? '';
  expiracao = this.authService.getTokenExpiration();

  ngOnInit(): void {
    this.carregarUsuario();
  }

  /** Chama a rota protegida /api/me enviando apenas o token (sem senha). */
  carregarUsuario(): void {
    this.mensagemErro.set('');

    this.authService.getMe().subscribe({
      next: usuario => this.usuario.set(usuario),
      error: () => this.mensagemErro.set('Não foi possível carregar os dados do usuário.')
    });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
