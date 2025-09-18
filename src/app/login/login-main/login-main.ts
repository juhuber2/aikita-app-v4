import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-main',
  imports: [ReactiveFormsModule],
  templateUrl: './login-main.html',
  styleUrl: './login-main.css'
})
export class LoginMain {
  constructor() {}
  
  loginForm: FormGroup = new FormGroup({
    EmailId: new FormControl(""),
    Password: new FormControl("")
  });

  http = inject(HttpClient);
  router = inject(Router);

 onLogin() {
  const apiUrl = "https://freeapi.miniprojectideas.com/api/User/Login"

  const formValue = this.loginForm.value;
    this.http.post(apiUrl, formValue).subscribe({
      next:(response:any) => {
        debugger;
          if (response.result) {
            alert("Login sucess");
            localStorage.setItem('angularToken', response.data.token)
            this.router.navigateByUrl("/dashboard")
          }
          else {
            alert(response.message)
          }
      },
      error:(error) => {
        debugger;
        alert(error.message)
      }
    })
}
}