/**
 * Auth Hooks
 * Custom hooks for authentication logic
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth.service';
import { setTokens, clearTokens, getRefreshToken } from '@/lib/api/client';
import { QUERY_KEYS } from '@/lib/config/api.config';
import { LoginRequest, RegisterRequest } from '@/lib/types';
import { useToast } from '@/lib/hooks/use-toast';

/**
 * Hook for user login
 */
export const useLogin = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      toast({
        title: 'Login Berhasil',
        description: `Selamat datang, ${data.user.fullName}!`,
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Login Gagal',
        description: error.response?.data?.message || 'Email atau password salah',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      toast({
        title: 'Registrasi Berhasil',
        description: 'Menunggu approval dari admin',
      });
      router.push('/login');
    },
    onError: (error: any) => {
      toast({
        title: 'Registrasi Gagal',
        description: error.response?.data?.message || 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    },
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      toast({
        title: 'Logout Berhasil',
        description: 'Sampai jumpa kembali!',
      });
      router.push('/login');
    },
  });
};

/**
 * Hook to get current user profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to check if user is authenticated
 */
export const useAuth = () => {
  const { data: user, isLoading, error } = useProfile();
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    isAdmin: user?.role === 'ADMIN',
  };
};
