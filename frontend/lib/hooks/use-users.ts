/**
 * Users Hooks
 * Custom React hooks for User management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from './use-toast';
import { usersApi } from '../api/users.service';
import { QUERY_KEYS } from '../config/api.config';
import type { 
  CreateUserDto, 
  UpdateUserDto, 
  UsersQueryParams 
} from '@/lib/api/users.service';

/**
 * Fetch all users with optional filters
 */
export function useUsers(params?: UsersQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, params],
    queryFn: () => usersApi.getAll(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch single user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Create new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['users', 'create'],
    mutationFn: (dto: CreateUserDto) => usersApi.create(dto),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      router.push('/dashboard/users');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['users', 'update'],
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) =>
      usersApi.update(id, dto),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS, variables.id] });
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      router.push('/dashboard/users');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['users', 'delete'],
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Approve user account
 */
export function useApproveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['users', 'approve'],
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) => 
      usersApi.approve(id, isApproved),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS, variables.id] });
      toast({
        title: 'Success',
        description: variables.isApproved 
          ? 'User approved successfully' 
          : 'User approval revoked successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user approval',
        variant: 'destructive',
      });
    },
  });
}
