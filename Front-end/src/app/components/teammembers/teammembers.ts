import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket';

@Component({
  selector: 'app-teammembers',
  imports: [CommonModule,FormsModule],
  templateUrl: './teammembers.html',
  styleUrl: './teammembers.css',
})
export class Teammembers {
  members: any[] = [];
  searchTerm: string = "";
  filteredMember: any[] = [];
  teamCount: number = 0;
currentPage: number = 1;
itemsPerPage: number = 5;
totalPages: any;
  constructor(private auth:Auth, private socket:SocketService ) {}

  ngOnInit() {
    this.loadMembers()
    const events = ["team_member_deleted", "team_member_created"]
  events.forEach(event => {
    this.socket.on(event, () => this.loadMembers());
  });
  }
  loadMembers() {
    this.auth.getTeamMembers(this.currentPage, this.itemsPerPage).subscribe((res: any) => {
     this.teamCount=res?.count
       this.members = res?.members || [];
      this.totalPages = res?.totalPages;
      this.currentPage = res?.page;
      this.itemsPerPage = res?.limit;
      this.filteredMember = [...this.members];
    });
  }
  
  searchMember() {
    const term = this.searchTerm.toLowerCase()
    this.filteredMember = this.members.filter(res => 
        res.name?.toLowerCase().startsWith(term) ||
        res?.email?.toLowerCase().startsWith(term)
    ) 
  }
    confirmDelete(id: string) {
    Swal.fire({
      title: "Are you sure?",
      text: "Deleting member will unassign all their tickets.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete"
    }).then(result => {
      if (result.isConfirmed) {
        this.delete(id);
      }
    });
  }
  delete(id:any) {
   this.auth.deleteTeamMember(id).subscribe({
    next: () => {
      Swal.fire("Deleted!", "Team Member Deleted.", "success");
        this.loadMembers()
    },
    error: err => Swal.fire("Error", err.error?.message || "Error deleting member", "error")
  });
  }
      nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.loadMembers();
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.loadMembers();
  }
}
}
