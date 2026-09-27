import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  carregando = signal(false);
  mensagemErro = signal('');

  onSubmit(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    this.carregando.set(true);
    this.mensagemErro.set('');

    this.authService.login(email, password).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/home']);
      },
      error: (error: HttpErrorResponse) => {
        this.carregando.set(false);
        this.mensagemErro.set(this.traduzirErro(error));
      }
    });
  }

  campoInvalido(campo: 'email' | 'password'): boolean {
    const control = this.loginForm.controls[campo];
    return control.invalid && control.touched;
  }

  private traduzirErro(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
    }

    return error.error?.erro ?? 'E-mail ou senha inválidos.';
  }
}
