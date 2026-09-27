import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  loginForm: FormGroup;

  mostrarMensagemLog: boolean = false;
  mensagemErro: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    this.authService.login(email, password).subscribe({

      next: (response) => {
        console.log('Login realizado com sucesso!');
        console.log('Token recebido:', response.token);

        this.mensagemErro = '';
        this.mostrarMensagemLog = true;

        setTimeout(() => {
          this.mostrarMensagemLog = false;
        }, 3000);
      },

      error: (error) => {
        console.error('Erro ao fazer login:', error);

        this.mostrarMensagemLog = false;
        this.mensagemErro = 'E-mail ou senha inválidos.';
      }

    });
  }

  testarAutenticacao(): void {
       this.authService.testarRotaProtegida().subscribe({
          next: (resposta) => {
             console.log('Rota protegida:', resposta);
        },
        error: (erro) => {
         console.error('Erro na rota protegida:', erro);
        }
      });
   }
  onForgotPassword(): void {
    console.log('Redirecionar para recuperação de senha');
  }

  onCreateAccount(): void {
    console.log('Redirecionar para criação de conta');
  }
}
