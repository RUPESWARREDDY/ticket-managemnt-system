import { Component } from '@angular/core';
import { Router} from '@angular/router';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.html',
  styleUrls: ['./access-denied.css'],
})
export class AccessDenied {
  constructor(private router: Router) {}

  submit() {
    this.router.navigate(['/login']);
  }
}
