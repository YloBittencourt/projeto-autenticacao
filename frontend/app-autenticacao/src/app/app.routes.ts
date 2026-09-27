import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard], title: 'Login' },
  { path: 'home', component: HomeComponent, canActivate: [authGuard], title: 'Área protegida' },
  { path: '**', redirectTo: 'login' }
];
