import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, registerLocaleData } from "@angular/common";
import { AppComponent } from './app.component';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { appRoutes } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { AuthenticationComponent } from "./authentication/authentication.component";
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RegisterStudentComponent } from './home/register-student/register-student.component';
import { MatStepperModule } from "@angular/material/stepper";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { InputFieldComponent } from './directives/input-field/input-field.component';
import { RegisterTenantComponent } from './home/register-tenant/register-tenant.component';
import { SettingsComponent } from './home/settings/settings.component';
import { ToastrComponent } from './directives/toastr/toastr.component';
import { ToastrModule } from "ngx-toastr";
import { AuthInterceptor } from "./auth/auth.interceptor";
import { OrderStudentComponent } from './home/order-student/order-student.component';
import { OrderContainerComponent } from './home/order-student/order-container/order-container.component';
import { MealInputCardComponent } from './home/order-student/meal-input-card/meal-input-card.component';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
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
import { MatDialogModule } from "@angular/material/dialog";
import { ButtonComponent } from './directives/button/button.component';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en';
import localeTr from '@angular/common/locales/tr';
import localeAr from '@angular/common/locales/ar';
import localeUk from '@angular/common/locales/uk';
import localeEs from '@angular/common/locales/es';
import localePl from '@angular/common/locales/pl';
import localeZh from '@angular/common/locales/zh';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import localeRu from '@angular/common/locales/ru';
import localeEl from '@angular/common/locales/el';
import localeRo from '@angular/common/locales/ro';
import localeNl from '@angular/common/locales/nl';
import localeHi from '@angular/common/locales/hi';
import localeYue from '@angular/common/locales/yue';
import localeBg from '@angular/common/locales/bg';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SchoolOverviewComponent } from './home/school-overview/school-overview.component';
import { BannerNoSubgroupOrderComponent } from './home/banners/banner-no-subgroup-order/banner-no-subgroup-order.component';
import { OrderHistoryComponent } from './home/order-history/order-history.component';
import { GeneralBannerComponent } from './home/banners/general-banner/general-banner.component';
import { MatTooltipModule } from "@angular/material/tooltip";
import { PaginationComponent } from './directives/pagination/pagination.component';
import { NgbPagination } from "@ng-bootstrap/ng-bootstrap";
import { BannerNoStudentOrderComponent } from './home/order-student/banner-no-student-order/banner-no-student-order.component';
import { WeekplanPdfComponent } from './home/weekplan-pdf/weekplan-pdf.component';
import { ConfirmWithdrawDialogComponent } from './home/account/account-payment/confirm-withdraw-dialog/confirm-withdraw-dialog.component';
import { OrderAllergeneDialogComponent } from './home/order-student/order-allergene-dialog/order-allergene-dialog.component';
import { PermanentOrdersComponent } from './home/permanent-orders/permanent-orders.component';
import { SuccessStripeComponent } from './home/stripe-checkout/success-stripe/success-stripe.component';
import { NotSuccessStripeComponent } from './home/stripe-checkout/not-success-stripe/not-success-stripe.component';
import { DateSelectionSingleComponent } from './home/order-student/date-selection-single/date-selection-single.component';
import { DialogErrorComponent } from './directives/dialog-error/dialog-error.component';
import { ExportCsvDialogComponent } from './directives/export-csv-dialog/export-csv-dialog.component';
import { AccuntDetailsComponent } from './home/account/accunt-details/accunt-details.component';
import { SelectLanguageComponent } from './directives/select-language/select-language.component';
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { SchoolAnnouncmentsComponent } from './home/school-announcments/school-announcments.component';
import { HelpDialogComponent } from './directives/help-dialog/help-dialog.component';
import { FirstAccessDialogComponent } from './directives/first-access-dialog/first-access-dialog.component';
import { HelpComponent } from './home/help/help.component';
import { MessageInfoBoxComponent } from './directives/message-info-box/message-info-box.component';
import { ConfirmDialogPermanetOrderComponent } from './home/permanent-orders/confirm-dialog-permanet-order/confirm-dialog-permanet-order.component';
import { TrimTextPipe } from "./directives/trim-text.pipe";
import { LabelTooltipComponent } from './directives/label-tooltip/label-tooltip.component';
import { ConfirmDeleteSpecialFoodComponent } from './home/directives/confirm-delete-special-food/confirm-delete-special-food.component';
import { ErrorWeekendBannerComponent } from './home/directives/error-weekend-banner/error-weekend-banner.component';
import { LanguageService } from "./service/language.service";
import { CustomToastrComponent } from './directives/custom-toastr/custom-toastr.component';
import { CustomDatePipe } from './directives/custom-date.pipe';
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { CloseAccountDialogComponent } from './directives/close-account-dialog/close-account-dialog.component';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FirstAccessOrderDialogComponent } from './directives/first-access-order-dialog/first-access-order-dialog.component';
import { DetailsOrderDialogComponent } from './home/order-history/details-order-dialog/details-order-dialog.component';
import { SeedComponent } from './home/seed/seed.component';
import { FaqComponent } from './home/faq/faq.component';
import { PersonalSettingsComponent } from './home/settings/personal-settings/personal-settings.component';
import { OrderSettingsComponent } from './home/settings/order-settings/order-settings.component';
import { ChangePasswordSettingsComponent } from './home/settings/change-password-settings/change-password-settings.component';
import { DeleteAccountSettingsComponent } from './home/settings/delete-account-settings/delete-account-settings.component';
import { ButComponent } from './home/but/but.component';
import { NoInternetComponent } from './no-internet/no-internet.component';
import {NetworkService} from "./service/network.service";
import { FeedbackComponent } from './home/feedback/feedback.component';
import { IbanFormatDirective } from './directives/iban-format.directive';
import {
  ConfirmDeletePermanentOrderDialogComponent
} from "./directives/confirm-delete-permanent-order-dialog/confirm-delete-permanent-order-dialog.component";
import { ConfirmStripePaymentComponent } from './home/account/account-payment/confirm-stripe-payment/confirm-stripe-payment.component';
import { DeleteStudentDialogComponent } from './directives/delete-student-dialog/delete-student-dialog.component';
import localeHr from '@angular/common/locales/hr';
import { ReportErrorDialogComponent } from './home/dialogs/report-error-dialog/report-error-dialog.component';
import { VacationParentComponent } from './home/vacation-parent/vacation-parent.component';

// AoT requires an exported function for factories
function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

registerLocaleData(localeDe, 'de');
registerLocaleData(localeEn, 'en');
registerLocaleData(localeTr, 'tr');
registerLocaleData(localeAr, 'ar');
registerLocaleData(localeUk, 'uk');
registerLocaleData(localeEs, 'es');
registerLocaleData(localePl, 'pl');
registerLocaleData(localeZh, 'zh');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeIt, 'it');
registerLocaleData(localeRu, 'ru');
registerLocaleData(localeEl, 'el');
registerLocaleData(localeRo, 'ro');
registerLocaleData(localeNl, 'nl');
registerLocaleData(localeHi, 'hi');
registerLocaleData(localeYue, 'yue');
registerLocaleData(localeBg, 'bg');
registerLocaleData(localeHr, 'hr');
function localeFactory(languageService: LanguageService) {
  return languageService.getLanguage();
}


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
    GeneralBannerComponent,
    PaginationComponent,
    BannerNoStudentOrderComponent,
    WeekplanPdfComponent,
    ConfirmWithdrawDialogComponent,
    OrderAllergeneDialogComponent,
    PermanentOrdersComponent,
    SuccessStripeComponent,
    NotSuccessStripeComponent,
    DateSelectionSingleComponent,
    DialogErrorComponent,
    ExportCsvDialogComponent,
    AccuntDetailsComponent,
    SelectLanguageComponent,
    SchoolAnnouncmentsComponent,
    HelpDialogComponent,
    FirstAccessDialogComponent,
    HelpComponent,
    MessageInfoBoxComponent,
    ConfirmDialogPermanetOrderComponent,
    TrimTextPipe,
    LabelTooltipComponent,
    ConfirmDeleteSpecialFoodComponent,
    ErrorWeekendBannerComponent,
    CustomToastrComponent,
    CustomDatePipe,
    CloseAccountDialogComponent,
    FirstAccessOrderDialogComponent,
    DetailsOrderDialogComponent,
    SeedComponent,
    FaqComponent,
    PersonalSettingsComponent,
    OrderSettingsComponent,
    ChangePasswordSettingsComponent,
    DeleteAccountSettingsComponent,
    ButComponent,
    NoInternetComponent,
    FeedbackComponent,
    IbanFormatDirective,
    ConfirmDeletePermanentOrderDialogComponent,
    ConfirmStripePaymentComponent,
    DeleteStudentDialogComponent,
    ReportErrorDialogComponent,
    VacationParentComponent,
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
    NgbPagination,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot({ mode: 'ios' })
  ],
  providers: [
    FileOpener,
    LanguageService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: LOCALE_ID,
      useFactory: localeFactory,
      deps: [LanguageService]
    },
    NetworkService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
