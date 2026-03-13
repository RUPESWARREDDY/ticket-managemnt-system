import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  form: FormGroup;
  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  get f() { return this.form.controls; }
  submit() {
    if (this.form.invalid) return;

    this.auth.sendOtp(this.form.value.email!).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'OTP sent to your email',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/verify-otp'], {
            queryParams: { email: this.form.value.email }
          });
        })
      },
      error: (err) => {
        console.log(err, "forgot-password error response"),
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: err.error.message,
            timer: 2000,
            showConfirmButton: false,
          })
      }
    });
  }
}
