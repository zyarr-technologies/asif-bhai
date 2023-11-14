//import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPAddressType, RelayConfigType } from './app.model';
import { IpcRenderer, IpcRendererEvent } from 'electron';
import { of } from 'rxjs'

// const httpOptions = {
//   headers: new HttpHeaders({
//     'Content-Type': 'application/json'
//   })
// };

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // apiUrl = 'http://localhost:3000/api';
  // constructor(private http: HttpClient) { }

  // connect<IPAddressType>(ipAddressInfo: IPAddressType) {
  //   return this.http.post<IPAddressType>(this.apiUrl + '/connect', ipAddressInfo, httpOptions)
  // }

  // disconnect<IPAddressType>(ipAddressInfo: IPAddressType) {
  //   return this.http.post<IPAddressType>(this.apiUrl + '/disconnect', ipAddressInfo, httpOptions)
  // }

  // relay_config<RelayConfigType>(relayConfig: RelayConfigType) {
  //   return this.http.post<RelayConfigType>(this.apiUrl + '/relayconfig', relayConfig, httpOptions)
  // }

  private ipc: IpcRenderer | undefined = void 0;
  constructor() {
    if (window.require) {
      try {
        this.ipc = window.require('electron').ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn("ELectron IPC was not loaded !!!")
    }
  }

  connect(ipAddressInfo: IPAddressType) {
    return of(this.send('connect', JSON.stringify(ipAddressInfo)))
  }

  disconnect(ipAddressInfo: IPAddressType) {
    return of(this.send('disconnect', JSON.stringify(ipAddressInfo)))
  }

  relay_config(relayConfig: RelayConfigType) {
    return of(this.send('relayconfig', JSON.stringify(relayConfig)))
  }

  on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): boolean {
    if (!this.ipc) {
      return false;
    }
    this.ipc.on(channel, listener);
    return true;
  }

  send(channel: string, ...args: any[]): boolean {
    if (!this.ipc) {
      return false;
    }
    this.ipc.send(channel, ...args);
    return true;
  }
}
