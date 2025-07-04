import { Routes } from '@angular/router';
import { HomeComponent } from "./home/home.component";
import { AuthGuard } from "./auth/auth.guard";
import { AuthenticationComponent } from "./authentication/authentication.component";
import { SignInComponent } from "./authentication/sign-in/sign-in.component";
import { ResetPasswordComponent } from "./authentication/reset-password/reset-password.component";
import { SignUpComponent } from "./authentication/sign-up/sign-up.component";
import { DashboardComponent } from "./home/dashboard/dashboard.component";
import { RegisterStudentComponent } from "./home/register-student/register-student.component";
import { MainGuard } from "./auth/main.guard";
import { RegisterTenantComponent } from "./home/register-tenant/register-tenant.component";
import { SettingsComponent } from "./home/settings/settings.component";
import { OrderStudentComponent } from "./home/order-student/order-student.component";
import {
  AccountPaymentOverviewComponent
} from "./home/account/account-payment-overview/account-payment-overview.component";
import { RegistrationComponent } from "./home/registration/registration/registration.component";
import { ChargeAccountComponent } from "./home/charge-account/charge-account.component";
import { OrderHistoryComponent } from "./home/order-history/order-history.component";
import { WeekplanPdfComponent } from "./home/weekplan-pdf/weekplan-pdf.component";
import { PermanentOrdersComponent } from "./home/permanent-orders/permanent-orders.component";
import { AccuntDetailsComponent } from "./home/account/accunt-details/accunt-details.component";
import { SchoolAnnouncmentsComponent } from "./home/school-announcments/school-announcments.component";
import { HelpDialogComponent } from "./directives/help-dialog/help-dialog.component";
import { HelpComponent } from "./home/help/help.component";
import { SuccessStripeComponent } from "./home/stripe-checkout/success-stripe/success-stripe.component";
import { NotSuccessStripeComponent } from "./home/stripe-checkout/not-success-stripe/not-success-stripe.component";
import { FaqComponent } from "./home/faq/faq.component";
import {
  DeleteAccountSettingsComponent
} from "./home/settings/delete-account-settings/delete-account-settings.component";
import { PersonalSettingsComponent } from "./home/settings/personal-settings/personal-settings.component";
import { OrderSettingsComponent } from "./home/settings/order-settings/order-settings.component";
import {
  ChangePasswordSettingsComponent
} from "./home/settings/change-password-settings/change-password-settings.component";
import { ButComponent } from "./home/but/but.component";
import { NoInternetComponent } from "./no-internet/no-internet.component";
import { FeedbackComponent } from "./home/feedback/feedback.component";
import { VacationParentComponent } from './home/vacation-parent/vacation-parent.component';
import { ContactCatererComponent } from './home/contact-caterer/contact-caterer.component';


export const appRoutes: Routes = [
  { path: '', redirectTo: '/home/dashboard', pathMatch: 'full' },
  { path: 'no-internet', component: NoInternetComponent },
  {
    path: 'signup', component: AuthenticationComponent,
    children: [{ path: '', component: SignUpComponent }]
  },
  {
    path: 'login', component: AuthenticationComponent,
    children: [{ path: '', component: SignInComponent }]
  },
  {
    path: 'success_stripe', component: SuccessStripeComponent,
  },
  { path: 'error_stripe', component: NotSuccessStripeComponent },

  {
    path: 'login', component: AuthenticationComponent,
    children: [{ path: '', component: SignInComponent }]
  },
  {
    path: 'password_reset', component: AuthenticationComponent,
    children: [{ path: '', component: ResetPasswordComponent }]
  },
  { path: 'register_tenant', component: RegisterTenantComponent, canActivate: [AuthGuard] },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'feedback', component: FeedbackComponent, canActivate: [AuthGuard] },
      { path: 'but', component: ButComponent, canActivate: [AuthGuard, MainGuard] },
      { path: 'help', component: HelpComponent, canActivate: [AuthGuard, MainGuard] },
      { path: 'permanent_order', component: PermanentOrdersComponent, canActivate: [AuthGuard, MainGuard] },
      { path: 'charge_account', component: ChargeAccountComponent, canActivate: [AuthGuard, MainGuard] },
      { path: 'register_student', component: RegisterStudentComponent, canActivate: [AuthGuard, MainGuard] },
      { path: 'details_account', component: AccuntDetailsComponent, canActivate: [AuthGuard, MainGuard] },
      { path: 'account_overview', component: AccountPaymentOverviewComponent, canActivate: [AuthGuard, MainGuard] },
      { path: 'messages', component: SchoolAnnouncmentsComponent, canActivate: [AuthGuard, MainGuard] },
      { path: 'order_student', component: OrderStudentComponent, canActivate: [AuthGuard, MainGuard] },
      { path: 'order_history', component: OrderHistoryComponent, canActivate: [AuthGuard, MainGuard] },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard, MainGuard] },
      { path: 'register', component: RegistrationComponent, canActivate: [AuthGuard] },
      { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
      { path: 'settings_delete_account', component: DeleteAccountSettingsComponent, canActivate: [AuthGuard] },
      { path: 'settings_personal', component: PersonalSettingsComponent, canActivate: [AuthGuard] },
      { path: 'settings_order', component: OrderSettingsComponent, canActivate: [AuthGuard] },
      { path: 'settings_password', component: ChangePasswordSettingsComponent, canActivate: [AuthGuard] },
      { path: 'settings_vacation', component: VacationParentComponent, canActivate: [AuthGuard] },
      { path: 'weekplan_pdf', component: WeekplanPdfComponent, canActivate: [AuthGuard] },
      { path: 'contact_caterer', component: ContactCatererComponent, canActivate: [AuthGuard] },
      { path: 'faq', component: FaqComponent },
    ]
  },
  {
    path: '', redirectTo: '/login', pathMatch: 'full'
  },
  { path: '**', redirectTo: '/home/dashboard', pathMatch: 'full' },

];
