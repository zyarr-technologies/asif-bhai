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
  title = 'Relay Configuration';
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

  subscriptions: Subscription[] = [];

  schedule!: FormGroup;
  relayScheduleControls: { formGroup: FormGroup; name: string }[] = [];;

  constructor(
    private formBuilder: FormBuilder,
    private readonly ipc: AppService) {

    this.schedule = this.formBuilder.group({
      relay1: this.relayScheduleCreateControls(),
      relay2: this.relayScheduleCreateControls(),
      relay3: this.relayScheduleCreateControls(),
      relay4: this.relayScheduleCreateControls(),
    });

    // Initialize relayControls
    for (let i = 1; i <= 4; i++) {
      this.relayScheduleControls.push({
        formGroup: this.schedule.get(`relay${i}`) as FormGroup,
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
    this.relayScheduleEnable()
    this.connectionConfig.get("ipaddress")?.disable();
    this.connectionConfig.get("port")?.disable();
  }

  private controlOnDisconnection() {
    this.isConnected = false;
    this.relayConfig.disable()
    this.relayScheduleDisable()
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
    dataToSend += 'R1#' + (data.relay1 === 'on' ? '1' : '0') + ";"
    dataToSend += 'R2#' + (data.relay2 === 'on' ? '1' : '0') + ";"
    dataToSend += 'R3#' + (data.relay3 === 'on' ? '1' : '0') + ";"
    dataToSend += 'R4#' + (data.relay4 === 'on' ? '1' : '0')

    //alert(dataToSend)
    this.ipc.send('relayconfig', 'manual$' + dataToSend);
  }

  private relayScheduleCreateControls(): FormGroup {
    return this.formBuilder.group({
      set1: this.relayScheduleCreateRelaySet(),
      set2: this.relayScheduleCreateRelaySet(),
      set3: this.relayScheduleCreateRelaySet(),
      set4: this.relayScheduleCreateRelaySet(),
    });
  }

  private relayScheduleCreateRelaySet(): FormGroup {
    return this.formBuilder.group({
      isChecked: [{ value: false, disabled: false }],
      time: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      state: [{ value: 'off', disabled: true }],
    });
  }

  relayScheduleDisable() {
    for (let eachRelayKey of Object.keys(this.schedule.controls)) {
      const eachRelayGroup = this.schedule.get(eachRelayKey) as FormGroup;

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

  relayScheduleEnable() {
    for (let eachRelayKey of Object.keys(this.schedule.controls)) {
      const eachRelayGroup = this.schedule.get(eachRelayKey) as FormGroup;

      for (let setKey of Object.keys(eachRelayGroup.controls)) {
        const eachControlGroup = eachRelayGroup.get(setKey) as FormGroup;

        eachControlGroup.get('isChecked')?.enable();
        // eachControlGroup.get('time')?.enable();
        // eachControlGroup.get('state')?.enable();
      }
    }
  }

  relayScheduleReset() {
    for (let eachRelayKey of Object.keys(this.schedule.controls)) {
      const eachRelayGroup = this.schedule.get(eachRelayKey) as FormGroup;

      for (let setKey of Object.keys(eachRelayGroup.controls)) {
        const eachControlGroup = eachRelayGroup.get(setKey) as FormGroup;

        eachControlGroup.get('isChecked')?.setValue(0);
        eachControlGroup.get('time')?.setValue('00:00');
        eachControlGroup.get('state')?.setValue('off');

        //eachControlGroup.get('isChecked')?.disable();
        eachControlGroup.get('time')?.disable();
        eachControlGroup.get('state')?.disable();
      }
    }
  }

  onRelayScheduleConfig() {
    let dataToSend = '';
    let isAllValid = true

    for (let eachRelayKey of Object.keys(this.schedule.controls)) {
      const eachRelayGroup = this.schedule.get(eachRelayKey) as FormGroup;

      if (eachRelayGroup.enabled) {
        const relayName = `R${eachRelayKey.slice(-1)}`;

        for (let setKey of Object.keys(eachRelayGroup.controls)) {
          const eachControlGroup = eachRelayGroup.get(setKey) as FormGroup;

          if (!eachControlGroup.valid) {
            isAllValid = false;
          }
          if (eachControlGroup.enabled && eachControlGroup.valid) {
            const isChecked = eachControlGroup.get('isChecked')?.value ? '1' : '0';
            if (isChecked == '1') {
              const time = eachControlGroup.get('time')?.value;
              const state = eachControlGroup.get('state')?.value === 'on' ? '1' : '0';

              dataToSend += `${relayName}#${time}#${state};`;
            }
          }
        }
      }
    }

    if (isAllValid) {
      //alert(dataToSend)
      this.ipc.send('relayconfig', 'schedule$' + dataToSend);
    }

  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
