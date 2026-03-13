import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Ticket as TicketService } from '../../services/ticket';
import { SocketService } from '../../services/socket';

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard {
activeTab: 'active' | 'closed' = 'active';
newTicketForm!: FormGroup;
currentTickets: any[] = [];
editingTicketId: string | null = null;
currentPage: number = 1;
itemsPerPage: number = 5;
totalPages: any;
totalTickets: any;
selectedTicket: any = null;



  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private auth: Auth,
    private socket: SocketService,
    private router: Router
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.newTicketForm = this.fb.group({
      category: ['', Validators.required],
      title: ['', Validators.required],
      priority: ['', Validators.required],
      date: [today, Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    
  this.loadTickets();
  this.socket.on('ticket_status_changed', () => this.loadTickets());
  this.socket.on('ticket_updated', () => this.loadTickets());
  this.socket.on('ticket_deleted', () => this.loadTickets());
  }
  switchTab(tab: 'active' | 'closed') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadTickets();
  }
  loadTickets() {
    const filter =
      this.activeTab === 'closed' ? 'Closed' : 'active';

    this.ticketService.getTickets(this.currentPage, this.itemsPerPage,filter).subscribe({
      next: (res) => {
        this.currentTickets = res.tickets;
        this.totalPages = res.totalPages;
        this.totalTickets = res.total;
        this.currentPage = res.page;
        this.itemsPerPage =res.limit; 
    },
      error: (err) => console.error(err)
    });
  }

 onCategoryChange() {
  const category = this.newTicketForm.get('category')?.value;
  const today = new Date().toISOString().split('T')[0];
  this.newTicketForm.patchValue({
    title: '',
    priority: '',
    date: today,
    description: ''
  });

  this.newTicketForm.markAsUntouched();
}

  handleSubmit() {
    if (this.newTicketForm.invalid) return;

    const formData = this.newTicketForm.value;

    if (this.editingTicketId) {
        this.ticketService.updateTicket(this.editingTicketId, formData).subscribe(() => {
        this.loadTickets();
        this.editingTicketId = null;
      });
    } else {
      this.ticketService.createTicket(formData).subscribe(() => {
        this.loadTickets();
      });
    }

    this.newTicketForm.reset();
  }
  get f() {
    return this.newTicketForm.controls;
   }
  handleDelete(id: string) {
    this.ticketService.deleteTicket(id).subscribe(() => (this.loadTickets() ));
  }
  openDeleteDialog(ticket: any) {
  this.selectedTicket = ticket;
}
  
openViewDialog(ticket: any) {
  this.selectedTicket = ticket;
}
 private formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
  }
  
  handleEditWithConfirmation(ticket: any) {
    this.editingTicketId = ticket._id;
    const formattedTicket = {
    ...ticket,
    date: ticket.date ? this.formatDate(ticket.date) : ''
  };
    this.newTicketForm.patchValue(formattedTicket);
  }

  cancel(){
    this.newTicketForm.reset();
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
