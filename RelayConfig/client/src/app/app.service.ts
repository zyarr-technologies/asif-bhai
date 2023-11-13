import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPAddressType } from './app.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) { }

  connect<IPAddressType>(ipAddressInfo: IPAddressType) {
    return this.http.post<IPAddressType>(this.apiUrl + '/connect', ipAddressInfo, httpOptions)
  }

  disconnect<IPAddressType>(ipAddressInfo: IPAddressType) {
    return this.http.post<IPAddressType>(this.apiUrl + '/disconnect', ipAddressInfo, httpOptions)
  }

  relay_config<RelayConfigType>(relayConfig: RelayConfigType) {
    return this.http.post<RelayConfigType>(this.apiUrl + '/relayconfig', relayConfig, httpOptions)
  }
}
