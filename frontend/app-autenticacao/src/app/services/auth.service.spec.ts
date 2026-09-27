import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { API_URL } from '../api.config';
import { fakeJwt } from '../testing/fake-jwt';

describe('AuthService + authInterceptor', () => {
  let service: AuthService;
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('considera autenticado apenas com token não expirado', () => {
    expect(service.isAuthenticated()).toBe(false);

    localStorage.setItem('access_token', fakeJwt(3600));
    expect(service.isAuthenticated()).toBe(true);

    localStorage.setItem('access_token', fakeJwt(-10));
    expect(service.isAuthenticated()).toBe(false);

    localStorage.setItem('access_token', 'lixo');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('logout remove o token', () => {
    localStorage.setItem('access_token', fakeJwt(3600));
    service.logout();
    expect(service.getToken()).toBeNull();
  });

  it('envia Authorization: Bearer nas rotas protegidas', () => {
    const token = fakeJwt(3600);
    localStorage.setItem('access_token', token);

    service.getMe().subscribe();

    const req = httpMock.expectOne(`${API_URL}/api/me`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({ email: 'aluno@email.com', roles: ['ROLE_USER'], mensagem: 'ok' });
  });

  it('não envia o token no login nem para outros domínios', () => {
    localStorage.setItem('access_token', fakeJwt(3600));

    service.login('aluno@email.com', '123456').subscribe();
    http.get('https://outro-site.com/dados').subscribe();

    const login = httpMock.expectOne(`${API_URL}/auth/login`);
    expect(login.request.headers.has('Authorization')).toBe(false);
    login.flush({ token: 'novo', tokenType: 'Bearer', expiresIn: 3600 });

    const externo = httpMock.expectOne('https://outro-site.com/dados');
    expect(externo.request.headers.has('Authorization')).toBe(false);
    externo.flush({});
  });

  it('em resposta 401 limpa o token e volta para /login', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    localStorage.setItem('access_token', fakeJwt(3600));

    service.getMe().subscribe({ error: () => {} });
    httpMock.expectOne(`${API_URL}/api/me`).flush(
      { erro: 'Token ausente, inválido ou expirado' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(service.getToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
