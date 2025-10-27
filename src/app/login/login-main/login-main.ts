import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-login-main',
  imports: [ReactiveFormsModule, NgClass, NgIf],
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

  showLogo = false;
  alertMessage: string = '';
  alertType: 'success' | 'danger' = 'success'; 

  
  ngOnInit() {
  setTimeout(() => this.showLogo = true, 100);
  }

 onLogin() {
  
  const apiUrl = `${environment.apiUrl}/api/accounts/login`;

  const formValue = this.loginForm.value;
    this.http.post(apiUrl, formValue).subscribe({
      next:(response:any) => { //Antwort vom Backend als JSON
        console.log("Response vom Server:", response);
        //debugger;
          if (response.sessionToken) { //Änderung für Sarah's login
            this.alertMessage = 'Login erfolgreich!';
            this.alertType = 'success';
            sessionStorage.setItem('angularToken', response.sessionToken) //Änderung für Sarah's login
            this.router.navigateByUrl("/dashboard")
          }
          else {
            alert("Login failed — kein Token erhalten")
          }
      },
      error:(error) => {
        debugger;
        this.alertMessage = 'Ein Fehler ist aufgetreten: ' + error.message;
        this.alertType = 'danger';
      }
    })
  }
}