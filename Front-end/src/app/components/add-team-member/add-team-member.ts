import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';
import { SocketService } from '../../services/socket';
@Component({
  selector: 'app-add-team-member',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './add-team-member.html',
  styleUrl: './add-team-member.css',
})
export class AddTeamMember {
  
teamForm:FormGroup

  constructor(private fb: FormBuilder, private auth: Auth,private socket:SocketService) {
    this.teamForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  }
  get f() {
  return  this.teamForm.controls;
}
  submitForm() {
    if (this.teamForm.invalid) return;

    this.auth.createTeamMember(this.teamForm.value).subscribe({
      next: (res: any) => {

      Swal.fire({
        icon: "success",
        title: res?.message,
        timer: 2000,
        showConfirmButton: false
      });
      this.teamForm.reset();
    },
    error: err => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.error.message
      });
    }
    });
  }
}
