import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class Ticket {
  private baseUrl = environment.apiUrl + '/tickets';

  constructor(private http: HttpClient, private auth: Auth) {}

  private getHeaders() {
    const token = this.auth.getToken();
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }
  //admin  get all tickets
  getAllTickets(page: number, limit: number) {
  return this.http.get(`${this.baseUrl}/all?page=${page}&limit=${limit}`, this.getHeaders());
  }
  //admin get ticket counts
  getTicketCounts() {
  return this.http.get(`${this.baseUrl}/admin/summary`, this.getHeaders());
  }
  //admin get ticket based on filter
  getTicketsByFilter(page: number, limit: number,type: string) {
  return this.http.get(`${this.baseUrl}/filter/${type}?page=${page}&limit=${limit}`, this.getHeaders());
}
// admin assign ticket to team member
  assignTicket(ticketId: string, memberId: string) {
  return this.http.post(`${this.baseUrl}/assign`, { ticketId, memberId }, this.getHeaders());
  }
  //team member get his tickets
  getAssignedTickets(page: number, limit: number) {
  return this.http.get(`${this.baseUrl}/assigned/all?page=${page}&limit=${limit}`, this.getHeaders());
}

  //team member  update ticket status
  updateTicketStatus(id: string, status: string) {
  return this.http.put(`${this.baseUrl}/${id}/status`, { status }, this.getHeaders());
  }

   //user create ticket
  createTicket(ticketData: any): Observable<any> {
    return this.http.post(this.baseUrl, ticketData, this.getHeaders());
  }
  //user get tickets
  getTickets(page: number, limit: number,filter:string): Observable<any> {
    return this.http.get(`${this.baseUrl}?page=${page}&limit=${limit}&filter=${filter}`, this.getHeaders());
  }
  //user update ticket
  updateTicket(id: string, ticketData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, ticketData, this.getHeaders());
  }
  //user delete ticket
  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}
