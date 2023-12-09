import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AppService } from './app.service';
import { IPAddressType, RelayConfigType } from './app.model'; import { IpcRendererEvent } from 'electron';
import { Subscription } from 'rxjs';
import { RelayControlComponent } from './relay-control/relay-control.component';

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

  // Define relay controls for each relay


  private subscriptions: Subscription[] = [];

  scheduling!: FormGroup;
  relayScheduleControls: { formGroup: FormGroup; name: string }[] = [];;

  constructor(
    private formBuilder: FormBuilder,
    private readonly ipc: AppService) {

    this.scheduling = this.formBuilder.group({
      relay1: this.createRelayControl(),
      relay2: this.createRelayControl(),
      relay3: this.createRelayControl(),
      relay4: this.createRelayControl(),
    });

    // Initialize relayControls
    for (let i = 1; i <= 4; i++) {
      this.relayScheduleControls.push({
        formGroup: this.scheduling.get(`relay${i}`) as FormGroup,
        name: `Relay ${i}`
      });
    }

    this.controlOnDisconnection()
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
    this.enableRelaySchedule()
    this.connectionConfig.get("ipaddress")?.disable();
    this.connectionConfig.get("port")?.disable();
  }

  private controlOnDisconnection() {
    this.isConnected = false;
    this.relayConfig.disable()
    this.disableRelaySchedule()
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


  private createRelayControl(): FormGroup {
    return this.formBuilder.group({
      set1: this.createSet(),
      set2: this.createSet(),
      set3: this.createSet(),
      set4: this.createSet(),
    });
  }

  // Function to create a set control (similar to your createSet function)
  private createSet(): FormGroup {
    return this.formBuilder.group({
      isChecked: [{ value: false, disabled: false }],
      time: [{ value: '00:00', disabled: true }],
      state: [{ value: 'off', disabled: true }],
    });
  }

  disableRelaySchedule() {
    for (let eachRelayKey of Object.keys(this.scheduling.controls)) {
      const eachRelayGroup = this.scheduling.get(eachRelayKey) as FormGroup;

      for (let setKey of Object.keys(eachRelayGroup.controls)) {
        const eachControlGroup = eachRelayGroup.get(setKey) as FormGroup;

        eachControlGroup.get('isChecked')?.setValue(0);
        // eachControlGroup.get('time')?.setValue('00:00');
        // eachControlGroup.get('state')?.setValue('off');

        eachControlGroup.get('isChecked')?.disable();
        eachControlGroup.get('time')?.disable();
        eachControlGroup.get('state')?.disable();
      }
    }
  }

  enableRelaySchedule() {
    for (let eachRelayKey of Object.keys(this.scheduling.controls)) {
      const eachRelayGroup = this.scheduling.get(eachRelayKey) as FormGroup;

      for (let setKey of Object.keys(eachRelayGroup.controls)) {
        const eachControlGroup = eachRelayGroup.get(setKey) as FormGroup;

        eachControlGroup.get('isChecked')?.enable();
        // eachControlGroup.get('time')?.enable();
        // eachControlGroup.get('state')?.enable();
      }
    }
  }

  onRelaySchedule() {
    let dataToSend = '';

    // Iterate through relay groups in scheduling form
    for (let eachRelayKey of Object.keys(this.scheduling.controls)) {
      const eachRelayGroup = this.scheduling.get(eachRelayKey) as FormGroup;

      // Check if the relay is enabled
      if (eachRelayGroup.enabled) {
        const relayName = `R${eachRelayKey.slice(-1)}`;

        // Iterate through sets in each relay group
        for (let setKey of Object.keys(eachRelayGroup.controls)) {
          const eachControlGroup = eachRelayGroup.get(setKey) as FormGroup;

          // Check if the set is enabled and has valid data
          if (eachControlGroup.enabled && eachControlGroup.valid) {
            const isChecked = eachControlGroup.get('isChecked')?.value ? '1' : '0';
            const time = eachControlGroup.get('time')?.value;
            const state = eachControlGroup.get('state')?.value === 'on' ? '1' : '0';

            // Format the data and append to the result string
            dataToSend += `${relayName}#${isChecked}#${time}#${state};`;
          }
        }
      }

      alert(dataToSend)
    }

    // Send the formatted data to the API
    this.ipc.send('relayconfig', dataToSend);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
