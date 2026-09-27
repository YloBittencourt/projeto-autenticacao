import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { authGuard, guestGuard } from './auth.guard';
import { fakeJwt } from '../testing/fake-jwt';

describe('Guards de autenticação', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  const executar = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() => guard(route, state));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient()]
    });
  });

  it('authGuard redireciona para /login sem token', () => {
    const resultado = executar(authGuard) as UrlTree;
    expect(resultado.toString()).toBe('/login');
  });

  it('authGuard libera com token válido', () => {
    localStorage.setItem('access_token', fakeJwt(3600));
    expect(executar(authGuard)).toBe(true);
  });

  it('authGuard bloqueia e limpa token expirado', () => {
    localStorage.setItem('access_token', fakeJwt(-10));

    const resultado = executar(authGuard) as UrlTree;

    expect(resultado.toString()).toBe('/login');
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('guestGuard manda usuário já logado para /home', () => {
    localStorage.setItem('access_token', fakeJwt(3600));
    const resultado = executar(guestGuard) as UrlTree;
    expect(resultado.toString()).toBe('/home');
  });
});
