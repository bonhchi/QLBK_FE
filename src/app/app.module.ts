import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { MaterialModule } from '@_modules/material.module';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

import { AlertModule, BreadcrumbModule, ConfirmModalModule, NotificationModule } from '@app/_components';
import { ErrorInterceptor, JwtInterceptor } from './_helpers';

import { AdminComponent } from './layouts/admin/admin.component';
import { HeaderComponent } from './layouts/admin/header/header.component';
import { FooterComponent } from './layouts/admin/footer/footer.component';
import { SidebarComponent } from './layouts/admin/sidebar/sidebar.component'; 
import { LoginComponent } from './layouts/auth/login/login.component';
import { DatePipe } from '@angular/common';
import { FeatherIconsComponent } from './_components/feather-icons/feather-icons.component';
import { MoneyAvailableComponent } from '@app/pages/money-available/money-available.component';


@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    LoginComponent,
    FeatherIconsComponent,
    MoneyAvailableComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AlertModule,
    BreadcrumbModule,
    ConfirmModalModule,
    NotificationModule,
    NgSelectModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, disableClose: true, maxWidth: '90vw' } },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
