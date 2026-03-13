import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, Form, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  email = '';
  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
    
    this.email = this.route.snapshot.queryParamMap.get('email')!;
       if (!this.email) {
      Swal.fire('Error', 'Email not provided', 'error');
      this.router.navigate(['/forgot-password']);
    }
  }
  get f() {
    return this.form.controls;
  }
  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }
  submit() {
    this.auth.resetPassword(this.email, this.form.value.password!).subscribe({
      next: (res) => {
       Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: "Password reset successfully",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => Swal.fire('Error', err?.error?.message, 'error'),
    });
  }
}
