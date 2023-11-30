import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import  {CommonModule} from "@angular/common";
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {appRoutes} from './app-routing.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
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
import {ToastrModule} from "ngx-toastr";
import {AuthInterceptor} from "./auth/auth.interceptor";
import { OrderStudentComponent } from './home/order-student/order-student.component';
import { OrderContainerComponent } from './home/order-student/order-container/order-container.component';
import { MealInputCardComponent } from './home/order-student/meal-input-card/meal-input-card.component';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import { AccountPaymentOverviewComponent } from './home/account/account-payment-overview/account-payment-overview.component';
import { RegistrationComponent } from './home/registration/registration/registration.component';
import { ManageRegistrationStudentComponent } from './home/registration/manage-registration-student/manage-registration-student.component';
import { SettingsTableOrderStudentsComponent } from './home/settings/settings-table-order-students/settings-table-order-students.component';
import { ChargeAccountComponent } from './home/charge-account/charge-account.component';

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
    ToastrComponent,
    OrderStudentComponent,
    OrderContainerComponent,
    MealInputCardComponent,
    AccountPaymentOverviewComponent,
    RegistrationComponent,
    ManageRegistrationStudentComponent,
    SettingsTableOrderStudentsComponent,
    ChargeAccountComponent
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
        FormsModule,
        ToastrModule.forRoot(),
        MatDatepickerModule,
      MatNativeDateModule

    ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
