import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { LoginComponent } from './login';
import { API_URL } from '../api.config';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('não chama o backend com formulário inválido', () => {
    component.onSubmit();

    httpMock.expectNone(`${API_URL}/auth/login`);
    expect(component.loginForm.touched).toBe(true);
  });

  it('envia email e senha e vai para /home no sucesso', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.loginForm.setValue({ email: 'aluno@email.com', password: '123456' });

    component.onSubmit();

    const req = httpMock.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'aluno@email.com', senha: '123456' });
    req.flush({ token: 'abc.def.ghi', tokenType: 'Bearer', expiresIn: 3600 });

    expect(localStorage.getItem('access_token')).toBe('abc.def.ghi');
    expect(navigate).toHaveBeenCalledWith(['/home']);
  });

  it('mostra a mensagem de erro do backend quando as credenciais são inválidas', async () => {
    component.loginForm.setValue({ email: 'aluno@email.com', password: 'errada' });

    component.onSubmit();
    httpMock.expectOne(`${API_URL}/auth/login`).flush(
      { status: 401, erro: 'E-mail ou senha inválidos' },
      { status: 401, statusText: 'Unauthorized' }
    );
    await fixture.whenStable();

    expect(component.mensagemErro()).toBe('E-mail ou senha inválidos');
    expect(fixture.nativeElement.querySelector('.alert-error').textContent)
      .toContain('E-mail ou senha inválidos');
    expect(component.carregando()).toBe(false);
  });
});
