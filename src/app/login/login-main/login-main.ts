import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login-main',
  imports: [ReactiveFormsModule],
  templateUrl: './login-main.html',
  styleUrl: './login-main.css'
})
export class LoginMain {
  constructor() {}
  
  loginForm: FormGroup = new FormGroup({
    Email: new FormControl(""),
    Password: new FormControl("")
  });

  http = inject(HttpClient);
  router = inject(Router);

 onLogin() {
  
  const apiUrl = `${environment.apiUrl}/api/accounts/login`;

  const formValue = this.loginForm.value;
    this.http.post(apiUrl, formValue).subscribe({
      next:(response:any) => { //Antwort vom Backend als JSON
        debugger;
          if (response.sessionToken) { //Änderung für Sarah's login
            alert("Login sucess");
            sessionStorage.setItem('angularToken', response.sessionToken) //Änderung für Sarah's login
            this.router.navigateByUrl("/dashboard")
          }
          else {
            alert("Login failed — kein Token erhalten")
          }
      },
      error:(error) => {
        debugger;
        alert(error.message)
      }
    })
  }
}