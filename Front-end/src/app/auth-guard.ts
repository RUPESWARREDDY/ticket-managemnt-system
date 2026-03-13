import { inject,PLATFORM_ID} from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID)
  if (!isPlatformBrowser(platformId))
  {
    return true
  }
  const role = sessionStorage.getItem('role');
  const token = sessionStorage.getItem('token');
  const router = inject(Router);
  if (token && role === 'user') {
    return true;
  } 
    
    router.navigate(['/login']);
  return false
};
