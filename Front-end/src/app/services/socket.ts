import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: any;

  constructor() {
    this.socket = io('http://localhost:4000');  // backend URL
  }

  //recieve
  on(eventName: string, callback: any) {
    this.socket.on(eventName, callback);
  }

  // send
  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}
