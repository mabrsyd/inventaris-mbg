/**
 * Auth API functions
 * Re-exports from auth.service.ts for direct imports
 */

import { authApi } from './auth.service';

export { authApi } from './auth.service';

// Direct exports for component imports
export const login = authApi.login;
export const registerUser = authApi.register;
export const logout = authApi.logout;
export const refreshToken = authApi.refreshToken;
export const getProfile = authApi.getProfile;