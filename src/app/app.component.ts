import { Component } from '@angular/core';
import { ValidatorComponent } from './validator/validator.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  template: `
    <app-validator></app-validator>
    <app-footer></app-footer>
  `,
  standalone: true,
  imports: [ValidatorComponent, FooterComponent]
})
export class AppComponent { }