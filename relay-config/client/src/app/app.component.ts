import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AppService } from './app.service';
import { IPAddressType, RelayConfigType } from './app.model'; import { IpcRendererEvent } from 'electron';

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

  constructor(
    private formBuilder: FormBuilder,
    private readonly ipc: AppService) {

    this.relayConfig.disable()
  }

  get ipaddress(): FormControl {
    return this.connectionConfig.get("ipaddress") as FormControl;
  }

  get port(): FormControl {
    return this.connectionConfig.get("port") as FormControl;
  }

  private controlOnConnection() {
    this.isConnected = true;
    this.relayConfig.enable()
    this.connectionConfig.get("ipaddress")?.disable();
    this.connectionConfig.get("port")?.disable();
  }

  private controlOnDisconnection() {
    this.isConnected = false;
    this.relayConfig.disable()
    this.connectionConfig.get("ipaddress")?.enable();
    this.connectionConfig.get("port")?.enable();
  }

  onOpenConnection() {
    let data = this.connectionConfig.value as IPAddressType
    this.ipc.send('connect', JSON.stringify(data));
    this.controlOnConnection();
    console.log("Connected............")
  }

  onCloseConnection() {
    let data = this.connectionConfig.value as IPAddressType
    this.ipc.send('disconnect', JSON.stringify(data));
    this.controlOnDisconnection();
    console.log("Disconnected............")
  }

  onRelayConfig() {
    let data = this.relayConfig.value as RelayConfigType
    let dataToSend = " "
    dataToSend += 'relay1' + data.relay1 + ":"
    dataToSend += 'relay2' + data.relay2 + ":"
    dataToSend += 'relay3' + data.relay3 + ":"
    dataToSend += 'relay4' + data.relay4
    this.ipc.send('relayconfig', dataToSend);
  }
}

