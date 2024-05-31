import { bootstrapApplication, DomSanitizer } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { APP_INITIALIZER } from '@angular/core';

const iconRegistryFactory = (iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) => {
  return () => {
    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/github.svg')
    );
  };
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([]),
    provideHttpClient(),
    MatIconRegistry,
    {
      provide: APP_INITIALIZER,
      useFactory: iconRegistryFactory,
      deps: [MatIconRegistry, DomSanitizer],
      multi: true
    }
  ]
}).catch(err => console.error(err));