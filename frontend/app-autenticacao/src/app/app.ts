import { Component } from '@angular/core';
import { LoginComponent } from './login/login'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'app-autenticacao';
}