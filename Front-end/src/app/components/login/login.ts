import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrls:[ './login.css'],
})
export class Login {
  loginForm: FormGroup;
  passwordVisible: boolean = false;
  constructor(
    private auth: Auth,
    private router: Router,
    private fb: FormBuilder
  ) { 
    this.loginForm = this.fb.group({
      email: ['',[Validators.required, Validators.email]],
      password: ['',[Validators.required, Validators.minLength(6)]],
    });
  }
   get f() {
    return this.loginForm.controls;
  }
 togglePassword() {
  this.passwordVisible = !this.passwordVisible;
}
  onSubmit() {
    if (this.loginForm.invalid) return;
    this.auth.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.auth.saveRole(res?.user?.role);
        this.auth.saveToken(res.token);
         Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: res.message,
              timer: 2000,
              showConfirmButton: false,
         });
         const dashboardRoutes: any = {
        admin: "/adminDashboard",
        teamMember: "/teamDashboard",
        user: "/userDashboard"
      };
        setTimeout(() => {
  this.router.navigate([dashboardRoutes[res.user.role]]);
}, 50);

      },
      error: (err) =>  Swal.fire({
              icon: 'error',
        title: 'Login Failed',
        text: err.error?.message || "Invalid credentials",
        timer: 2000,
        showConfirmButton: false
            }),
    });
  }
 
}
