import { Component } from '@angular/core';
import { Ticket as TicketService } from '../../services/ticket';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../services/socket';
@Component({
  selector: 'app-team-dashboard',
  imports: [CommonModule,FormsModule,],
  templateUrl: './team-dashboard.html',
  styleUrl: './team-dashboard.css',
})
export class TeamDashboard {
  tickets: any[] = [];
  filteredTickets: any[] = [];
  searchTerm: string = "";
  filterStatus = "All";
  filterPriority = "All";
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  selectedTicket: any = null;


  constructor(private ticketService: TicketService,private auth:Auth,private socket: SocketService,private router:Router) {}

  ngOnInit(): void {
    this.loadTickets();
    const events = [
      'ticket_updated',
      'ticket_deleted',
      'ticket_created',
      'ticket_assigned',
      'ticket_status_changed'
    ]
    events.forEach(event => {
      this.socket.on(event, () => this.loadTickets());
    });
  }

  loadTickets() {
    this.ticketService.getAssignedTickets(this.currentPage, this.itemsPerPage)
      .subscribe((res: any) => {
         const priorityOrder: any = { High: 1, Medium: 2, Low: 3 };
          this.tickets = res.tickets.sort(
          (a:any, b:any) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        this.applyFilters();
    this.totalPages = res.totalPages;
  });

  }
   applyFilters() {
    let data = [...this.tickets];

    // Filter by Status
    if (this.filterStatus !== "All") {
      data = data.filter(t => t.status === this.filterStatus);
    }

    // Filter by Priority
    if (this.filterPriority !== "All") {
      data = data.filter(t => t.priority === this.filterPriority);
    }

    // Search filter
    const term = this.searchTerm.toLowerCase();
    data = data.filter(t =>
      t.title?.toLowerCase().startsWith(term) ||
      t.category?.toLowerCase().startsWith(term) ||
      t.userId?.email?.toLowerCase().startsWith(term)
    );

    this.filteredTickets = data;
  }
   searchTickets() {
    this.applyFilters();
  }
 openTicketDetails(ticket: any) {
  this.selectedTicket = ticket;
}
  updateStatus(ticket: any) {
    this.ticketService.updateTicketStatus(ticket._id, ticket.status).subscribe(
      (res) =>
        Swal.fire(
          'Success',
          'Ticket status updated successfully',
          'success'
        ).then(() => {
          this.loadTickets();
        } ),
      (err) => console.error(err)
    );
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
  logout() {
    this.auth.logout();
     this.router.navigate(['/login']);
    }
}
