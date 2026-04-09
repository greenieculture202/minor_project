import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../services/auth.api';

export const adminGuard = () => {
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  if (authApi.isAdmin()) {
    return true;
  }

  // Not an admin, redirect to home
  router.navigate(['/']);
  return false;
};
