import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
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
  }

  get ipaddress(): FormControl {
    return this.connectionConfig.get("ipaddress") as FormControl;
  }

  get port(): FormControl {
    return this.connectionConfig.get("port") as FormControl;
  }

  onConnectionConfig() {
    this.apiService.connect<IPAddressType>(this.connectionConfig.value as IPAddressType)
      .subscribe(result => { console.log(result) });
  }

  onRelayConfig() {
    this.apiService.relay_config<RelayConfigType>(this.relayConfig.value as RelayConfigType)
      .subscribe(result => { console.log(result) });
  }

}


