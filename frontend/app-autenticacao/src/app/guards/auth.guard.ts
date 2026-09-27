import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Só deixa entrar em rotas protegidas quem tem token válido. */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  authService.logout();
  return inject(Router).createUrlTree(['/login']);
};

/** Quem já está logado não precisa ver a tela de login de novo. */
export const guestGuard: CanActivateFn = () => {
  return inject(AuthService).isAuthenticated()
    ? inject(Router).createUrlTree(['/home'])
    : true;
};
