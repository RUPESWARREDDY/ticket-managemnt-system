import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-verify-otp',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css',
})
export class VerifyOtp {
  email = '';
  form: FormGroup; 

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router
  ) {
     this.form = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });
    this.email = this.route.snapshot.queryParamMap.get('email')!;
  }
  get f() { return this.form.controls; }
  submit() {
    this.auth.verifyOtp(this.email, this.form.value.otp!).subscribe({
      next: (res:any) => {
        Swal.fire('Success', res?.data?.message,'success');
        this.router.navigate(['/reset-password'], {
          queryParams: { email: this.email }
        });
      },
      error: (err) => Swal.fire('Error', err.error.message, 'error'),
    });
  }
  
resendOTP() {
   this.auth.sendOtp(this.email).subscribe({
        next: (res:any) => {
          Swal.fire('Success', res?.data?.message, 'success');
        },
        error: (err) => Swal.fire('Error', err.error.message, 'error'),
   });
  this.form.reset();
}
}
