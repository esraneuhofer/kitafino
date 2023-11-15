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

      { path: 'dashboard', component:DashboardComponent , canActivate: [AuthGuard,MainGuard]},
      { path: 'register_student', component:RegisterStudentComponent , canActivate: [AuthGuard]},
      { path: 'settings', component:SettingsComponent , canActivate: [AuthGuard]},

    ]
  },
  {
    path: '', redirectTo: '/login', pathMatch: 'full'
  }
];
