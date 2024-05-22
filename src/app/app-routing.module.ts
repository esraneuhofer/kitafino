import {Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {AuthGuard} from "./auth/auth.guard";
import {AuthenticationComponent} from "./authentication/authentication.component";
import {SignInComponent} from "./authentication/sign-in/sign-in.component";
import {ResetPasswordComponent} from "./authentication/reset-password/reset-password.component";
import {SignUpComponent} from "./authentication/sign-up/sign-up.component";
import {DashboardComponent} from "./home/dashboard/dashboard.component";
import {RegisterStudentComponent} from "./home/register-student/register-student.component";
import {MainGuard} from "./auth/main.guard";
import {RegisterTenantComponent} from "./home/register-tenant/register-tenant.component";
import {SettingsComponent} from "./home/settings/settings.component";
import {OrderStudentComponent} from "./home/order-student/order-student.component";
import {
  AccountPaymentOverviewComponent
} from "./home/account/account-payment-overview/account-payment-overview.component";
import {RegistrationComponent} from "./home/registration/registration/registration.component";
import {ChargeAccountComponent} from "./home/charge-account/charge-account.component";
import {OrderHistoryComponent} from "./home/order-history/order-history.component";
import {KindergardenSettingComponent} from "./home/kindergarden-setting/kindergarden-setting.component";
import {WeekplanPdfComponent} from "./home/weekplan-pdf/weekplan-pdf.component";
import {PermanentOrdersComponent} from "./home/permanent-orders/permanent-orders.component";
import {AccuntDetailsComponent} from "./home/account/accunt-details/accunt-details.component";



export const appRoutes: Routes = [
  {
    path: 'signup', component: AuthenticationComponent,
    children: [{path: '', component: SignUpComponent}]
  },

  {
    path: 'login', component: AuthenticationComponent,
    children: [{path: '', component: SignInComponent}]
  },
  {
    path: 'password_reset', component: AuthenticationComponent,
    children: [{path: '', component: ResetPasswordComponent}]
  },
  { path: 'register_tenant', component:RegisterTenantComponent , canActivate: [AuthGuard]},
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [

      { path: 'permanent_order', component:PermanentOrdersComponent , canActivate: [AuthGuard,MainGuard]},
      { path: 'charge_account', component:ChargeAccountComponent , canActivate: [AuthGuard,MainGuard]},
      { path: 'register_student', component:RegisterStudentComponent , canActivate: [AuthGuard,MainGuard]},
      { path: 'details_account', component:AccuntDetailsComponent , canActivate: [AuthGuard,MainGuard]},
      { path: 'account_overview', component:AccountPaymentOverviewComponent , canActivate: [AuthGuard,MainGuard]},
      { path: 'kindergarten_settings', component:KindergardenSettingComponent , canActivate: [AuthGuard,MainGuard]},
      { path: 'order_student', component:OrderStudentComponent , canActivate: [AuthGuard,MainGuard]},
      { path: 'order_history', component:OrderHistoryComponent , canActivate: [AuthGuard,MainGuard]},
      { path: 'dashboard', component:DashboardComponent , canActivate: [AuthGuard,MainGuard]},
      { path: 'register', component:RegistrationComponent , canActivate: [AuthGuard]},
      { path: 'settings', component:SettingsComponent , canActivate: [AuthGuard]},
      { path: 'weekplan_pdf', component:WeekplanPdfComponent , canActivate: [AuthGuard]},
    ]
  },
  {
    path: '', redirectTo: '/login', pathMatch: 'full'
  }
];
