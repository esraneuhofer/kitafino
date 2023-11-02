import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import  {CommonModule} from "@angular/common";
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {appRoutes} from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { AuthenticationComponent} from "./authentication/authentication.component";
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RegisterStudentComponent } from './home/register-student/register-student.component';
import {MatStepperModule} from "@angular/material/stepper";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import { InputFieldComponent } from './directives/input-field/input-field.component';
import { RegisterTenantComponent } from './home/register-tenant/register-tenant.component';
import { SettingsComponent } from './home/settings/settings.component';
import { ToastrComponent } from './directives/toastr/toastr.component';
//
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SignInComponent,
    SignUpComponent,
    ResetPasswordComponent,
    AuthenticationComponent,
    DashboardComponent,
    RegisterStudentComponent,
    InputFieldComponent,
    RegisterTenantComponent,
    SettingsComponent,
    ToastrComponent
  ],
    imports: [
        BrowserModule,
        CommonModule,
        RouterModule.forRoot(appRoutes),
        HttpClientModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        FormsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
