// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app';
import { provideRouter } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { PoModule, PoUploadComponent } from '@po-ui/ng-components';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';
import { provideEnvironmentNgxMask } from 'ngx-mask';

import { Component, LOCALE_ID } from '@angular/core';
import localeIt from '@angular/common/locales/it';
import localeItExtra from '@angular/common/locales/extra/it';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeIt, 'pt-BR', localeItExtra);

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, PoModule, FormsModule, ReactiveFormsModule),
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()),
        provideEnvironmentNgxMask(),
        provideRouter(routes),
        {provide: LOCALE_ID, useValue: 'pt-BR' },
    
        
    ]
})
  .catch(err => console.error(err));
