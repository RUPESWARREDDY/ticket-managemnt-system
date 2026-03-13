import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Ticket } from '../../services/ticket';
import { Auth } from '../../services/auth';
import { SocketService } from '../../services/socket';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ticketlist',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './ticketlist.html',
  styleUrl: './ticketlist.css',
})
export class Ticketlist {
 @Input() type: any;
  title = "";
  tickets: any[] = [];
  teamMembers: any[] = [];
  currentPage: number = 1;
itemsPerPage: number = 5;
totalPages: any;
  totalTickets: any;
  
  constructor(private ticket: Ticket,private auth:Auth,private socket:SocketService) {}

  ngOnInit() {
    this.title = this.type === "all" ? "All Tickets" : this.type + " Tickets";
    this.loadTickets();
    this.loadTeamMembers();
    this.socket.on('ticket_created', () => this.loadTickets())
    this.socket.on('ticket_updated', () => this.loadTickets())
    this.socket.on('ticket_deleted', () => this.loadTickets())
    this.socket.on('team_member_created',()=>this.loadTeamMembers())
  }

  loadTickets() {
    this.ticket.getTicketsByFilter(this.currentPage, this.itemsPerPage, this.type).subscribe({
      next: (res:any) => {
           const priorityOrder: any = { High: 1, Medium: 2, Low: 3 };
          this.tickets = res.tickets.sort(
          (a:any, b:any) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        this.totalPages = res?.totalPages;
        this.totalTickets = res?.total;
        this.currentPage = res?.page;
        this.itemsPerPage = res?.limit;
      },
      error: () => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error loading tickets"
        });
      }

    });
  }

  loadTeamMembers() {
    const page: any = '';
      const limit: any = '';
    this.auth.getTeamMembers(page, limit).subscribe((res: any) => {
     return this.teamMembers = res.members;
    });
  }

  assignTeam(ticketId: string, event: Event) {
    const memberId = (event.target as HTMLSelectElement).value;
    if (!memberId) return;

    this.ticket.assignTicket(ticketId, memberId).subscribe(() => {
      Swal.fire({
        icon: "success",
        title: "Ticket Assigned Successfully",
        timer: 2000,
        showConfirmButton: false
      }).then(() => { this.loadTickets(); });
    });
  }
    nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.loadTickets();
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.loadTickets();
  }
}
}
