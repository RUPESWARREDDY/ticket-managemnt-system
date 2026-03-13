import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl = environment.apiUrl + '/auth';
  private isBrowser: boolean;
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID)  platformId: Object)
  {
    this.isBrowser = isPlatformBrowser(platformId);
   }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }
   login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
 createTeamMember(data: any) {
  return this.http.post(`${this.baseUrl}/team/create`, data);
}
  getTeamMembers(page:number,limit:number) {
   return this.http.get(`${this.baseUrl}/team?page=${page}&limit=${limit}`);
  }
  deleteTeamMember(id:any) {
     return this.http.delete(`${this.baseUrl}/admin/delete/${id}`)
  }
 
 sendOtp(email: string) {
  return this.http.post(`${this.baseUrl}/forgot-password`, { email });
}

verifyOtp(email: string, otp: string) {
  return this.http.post(`${this.baseUrl}/verify-otp`, { email, otp });
}

resetPassword(email: string, password: string) {
  return this.http.post(`${this.baseUrl}/reset-password`, { email, password });
}
   // Token and Role Management in Local Storage
  saveToken(token: string) {
    if ( this.isBrowser) {
      sessionStorage.setItem('token', token);
    }
  }

  saveRole(role: string) {
    if ( this.isBrowser) {
      sessionStorage.setItem('role', role);
    }
  }

  getRole(): string | null {
    if ( this.isBrowser) {
      return sessionStorage.getItem('role');
    }
    return null;
  }

  getToken(): string | null {
    if ( this.isBrowser) {
      return sessionStorage.getItem('token');
    }
    return null;
  }

  logout() {
    if ( this.isBrowser) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.clear()
    }
  }
}
