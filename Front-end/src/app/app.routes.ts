import { Routes } from '@angular/router';
import { authGuard } from './auth-guard';
import { adminGuard } from './admin-guard';
import { teamguardGuard } from './teamguard-guard';

export const routes: Routes = [
  {
    path:"",redirectTo: "login", pathMatch: "full"
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register').then((m) => m.Register),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then((m) => m.Login),
  },
   {
    path: "adminDashboard",
    loadComponent: () =>
      import('./components/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
    canActivate: [adminGuard],
  },
  {
    path: "teamDashboard",
    loadComponent: () => import("./components/team-dashboard/team-dashboard").then((m) => m.TeamDashboard),
     canActivate: [teamguardGuard],
  },
  {
    path: 'userDashboard',
    loadComponent: () =>
      import('./components/user-dashboard/user-dashboard').then((m) => m.UserDashboard),
    canActivate: [authGuard],
  },
 
  {
  path: "forgot-password",
  loadComponent: () => import('./components/forgot-password/forgot-password').then(m => m.ForgotPassword)
},
{
  path: "verify-otp",
  loadComponent: () => import('./components/verify-otp/verify-otp').then(m => m.VerifyOtp)
},
{
  path: "reset-password",
  loadComponent: () => import('./components/reset-password/reset-password').then(m => m.ResetPassword)
},
  {
    path: 'accessDenied',
    loadComponent: () =>
      import('./components/access-denied/access-denied').then((m) => m.AccessDenied),
  },
  {
    path: '**',
    redirectTo: 'accessDenied',
  }
];
