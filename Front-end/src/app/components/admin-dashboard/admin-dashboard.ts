import { Auth } from './../../services/auth';
import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { Ticket as TicketService } from '../../services/ticket';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Ticketlist } from '../ticketlist/ticketlist';
import { AddTeamMember } from '../add-team-member/add-team-member';
import { Teammembers } from '../teammembers/teammembers';
import { SocketService } from '../../services/socket';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule,FormsModule,AddTeamMember,Teammembers,Ticketlist],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  constructor(private ticketService: TicketService,private socket: SocketService,private auth:Auth,private router:Router) {
    
  }
  activeMenu = 'dashboard';
  Time:any=new Date()
  totalTickets = 0;
  openTickets = 0;
  progressTickets = 0;
  closedTickets = 0;
  teamCount = 0;
  loadView(view: string) {
    this.activeMenu = view;
  }


  ngOnInit() {
  this.loadCounts();
  this.updateTime()
    setInterval(() => this.updateTime(), 1000)
    const events = [
      'ticket_created',
      'ticket_deleted',
      'ticket_status_changed',
      'ticket_assigned',
      'team_member_created',
      'team_member_deleted'
    ]
    events.forEach(event => {
      this.socket.on(event, () => this.loadCounts());
    });
}
 updateTime() {
  this.Time = new Date().toLocaleTimeString();
}
  loadCounts() {
    this.ticketService.getTicketCounts().subscribe({
      next: (res: any) => {
        this.openTickets = res?.open;
        this.closedTickets = res?.closed;
        this.progressTickets = res?.progress;
        this.totalTickets = res?.total;
        this.teamCount = res?.teamCount;
      },
      error: () => {
        Swal.fire("Error loading dashboard")
      }
    });
  }

  logout() {
   sessionStorage.clear();
   this.router.navigate(['/login']);
  }
}
