import { inject, PLATFORM_ID  } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const adminGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
    await new Promise(resolve => setTimeout(resolve, 50));
  const role = sessionStorage.getItem('role');
  const token = sessionStorage.getItem('token');
  if (token && role === 'admin') {
    return true;

  } 
  router.navigate(['/accessDenied']);
  return false
};

