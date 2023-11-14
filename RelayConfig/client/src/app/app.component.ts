import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ApiService } from './app.service';
import { IPAddressType, RelayConfigType } from './app.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
  isConnected = false;

  connectionConfig = this.formBuilder.group({
    ipaddress: ['', [Validators.required, Validators.pattern('(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)')]],
    port: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5), Validators.pattern("[0-9]*")]],
  });

  relayConfig = this.formBuilder.group({
    relay1: 'off',
    relay2: 'off',
    relay3: 'off',
    relay4: 'off'
  });

  constructor(private formBuilder: FormBuilder,
    private apiService: ApiService) {
    this.relayConfig.disable()
  }


  get ipaddress(): FormControl {
    return this.connectionConfig.get("ipaddress") as FormControl;
  }

  get port(): FormControl {
    return this.connectionConfig.get("port") as FormControl;
  }

  controlOnConnection() {
    this.isConnected = true;
    this.relayConfig.enable()
    this.connectionConfig.get("ipaddress")?.disable();
    this.connectionConfig.get("port")?.disable();
  }

  controlOnDisconnection() {
    this.isConnected = false;
    this.relayConfig.disable()
    this.connectionConfig.get("ipaddress")?.enable();
    this.connectionConfig.get("port")?.enable();
  }

  onOpenConnection() {
    this.apiService.connect(this.connectionConfig.value as IPAddressType)
      .subscribe(result => {
        console.log(result)
        console.log("Connected............")
        this.controlOnConnection();
      });
  }

  onCloseConnection() {
    this.apiService.disconnect(this.connectionConfig.value as IPAddressType)
      .subscribe(result => {
        console.log(result)
        console.log("Disconnected............")
        this.controlOnDisconnection();
      });
  }

  onRelayConfig() {
    this.apiService.relay_config(this.relayConfig.value as RelayConfigType)
      .subscribe(result => { console.log(result) });
  }

}


