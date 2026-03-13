import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-register',
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  passwordVisible: boolean = false;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{6,}$/)]],
      confirmPassword: ['', Validators.required]
     }, {
      validators: this.matchPasswords('password', 'confirmPassword')
    });
  }

  get f() { return this.registerForm.controls; }
  matchPasswords(password: string, confirmPassword: string) {
  return (form: FormGroup) => {
    const pass = form.get(password);
    const confirm = form.get(confirmPassword);

    if (confirm?.errors && !confirm.errors['mismatch']) {
      return;
    }

    if (pass?.value !== confirm?.value) {
      confirm?.setErrors({ mismatch: true });
    } else {
      confirm?.setErrors(null);
    }
  };
}

 togglePassword() {
  this.passwordVisible = !this.passwordVisible;
  }
  
  onSubmit() {
    if (this.registerForm.invalid) return;
      const payload = {
    name: this.f['name'].value.trim(),
    email: this.f['email'].value.trim(),
    password: this.f['password'].value
  };
    this.auth.register(payload).subscribe({
      next: (res) => {
      Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: res.message,
      timer: 2000,
      showConfirmButton: false,
      }).then(() => {
        this.router.navigate(['/login']);
      });
      },
       error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: err.error.message,
            timer: 2000,
            showConfirmButton: false,
          });
        }
    });
  }
}


