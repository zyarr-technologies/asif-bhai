import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-relay-control',
  templateUrl: './relay-control.component.html',
  styleUrls: ['./relay-control.component.css']
})
export class RelayControlComponent {
  @Input() relayGroup: FormGroup = this.formBuilder.group({}); // Provide an initializer
  @Input() relayName: string = ''; // Provide an initializer


  constructor(private formBuilder: FormBuilder) { }

  onCheckboxChange(setKey: string) {
    const isChecked = this.relayGroup.get(setKey + '.isChecked')?.value;

    // Enable/disable controls based on checkbox value
    if (isChecked) {
      this.relayGroup.get(setKey + '.time')?.enable();
      this.relayGroup.get(setKey + '.state')?.enable();
    } else {
      this.relayGroup.get(setKey + '.time')?.disable();
      this.relayGroup.get(setKey + '.state')?.disable();
    }
  }
}
