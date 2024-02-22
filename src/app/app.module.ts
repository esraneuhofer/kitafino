import {LOCALE_ID, NgModule} from '@angular/core';
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
import { RegistrationInputComponent } from './home/registration-input/registration-input.component';
import { LoadingPageComponent } from './directives/loading-page/loading-page.component';
import { ButtonSpinnerComponent } from './directives/button-spinner/button-spinner.component';
import { DateSelectionComponent } from './home/order-student/date-selection/date-selection.component';
import { BannerNoRegistrationOrderComponent } from './home/order-student/banner-no-registration-order/banner-no-registration-order.component';
import { ConfirmOrderComponent } from './home/dialogs/confirm-order/confirm-order.component';
import {MatDialogModule} from "@angular/material/dialog";
import { ButtonComponent } from './directives/button/button.component';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SchoolOverviewComponent } from './home/school-overview/school-overview.component';
import { BannerNoSubgroupOrderComponent } from './home/banners/banner-no-subgroup-order/banner-no-subgroup-order.component';
import { OrderHistoryComponent } from './home/order-history/order-history.component';
import { KindergardenSettingComponent } from './home/kindergarden-setting/kindergarden-setting.component';
import { GeneralBannerComponent } from './home/banners/general-banner/general-banner.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import { PaginationComponent } from './directives/pagination/pagination.component';
import {NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import { BannerNoStudentOrderComponent } from './home/order-student/banner-no-student-order/banner-no-student-order.component';
import { WeekplanPdfComponent } from './home/weekplan-pdf/weekplan-pdf.component';
import { ConfirmWithdrawDialogComponent } from './home/account/account-payment/confirm-withdraw-dialog/confirm-withdraw-dialog.component';
import { OrderAllergeneDialogComponent } from './home/order-student/order-allergene-dialog/order-allergene-dialog.component';

registerLocaleData(localeDe);

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
    ChargeAccountComponent,
    RegistrationInputComponent,
    LoadingPageComponent,
    ButtonSpinnerComponent,
    DateSelectionComponent,
    BannerNoRegistrationOrderComponent,
    ConfirmOrderComponent,
    ButtonComponent,
    SchoolOverviewComponent,
    BannerNoSubgroupOrderComponent,
    OrderHistoryComponent,
    KindergardenSettingComponent,
    GeneralBannerComponent,
    PaginationComponent,
    BannerNoStudentOrderComponent,
    WeekplanPdfComponent,
    ConfirmWithdrawDialogComponent,
    OrderAllergeneDialogComponent,
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
    MatNativeDateModule,
    MatDialogModule,
    FontAwesomeModule,
    MatTooltipModule,
    NgbPagination

  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  },  {
    provide: LOCALE_ID,
    useValue: 'de-DE'
  }],
  bootstrap: [AppComponent],

})
export class AppModule { }
