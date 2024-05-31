import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { isCompanyNrOrSsnValid, NumberValid } from './orgnr-or-ssn-validator';

@Component({
  selector: 'app-validator',
  templateUrl: './validator.component.html',
  styleUrls: ['./validator.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class ValidatorComponent {
  form: FormGroup;
  validationResult?: NumberValid;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      inputField: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.validationResult = isCompanyNrOrSsnValid(this.form.get('inputField')?.value, 1);
    this.validationResult.isValid ? 
    this.form.controls['inputField'].setErrors({'incorrect': false}): 
    this.form.controls['inputField'].setErrors({'incorrect': true});

  }
}