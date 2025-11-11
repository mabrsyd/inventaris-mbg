"use client"

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useApproveUser, useDeleteUser } from '@/lib/hooks/use-users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import { ArrowLeft, CheckCircle, Trash2, Edit, Mail, MapPin, Shield } from 'lucide-react';
import type { User } from '@/lib/types';

const UserDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Use hooks for data fetching and mutations
  const { data: user, isLoading, error } = useUser(id);
  const approveMutation = useApproveUser();
  const deleteMutation = useDeleteUser();

  // Handle approve
  const handleApprove = () => {
    approveMutation.mutate({ id, isApproved: true });
  };

  // Handle delete with redirect
  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push('/dashboard/users');
      },
    });
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'default';
      case 'WAREHOUSE_STAFF':
        return 'secondary';
      case 'KITCHEN_STAFF':
        return 'outline';
      case 'DISTRIBUTION_STAFF':
        return 'outline';
      case 'BENEFICIARY_POINT':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="my-8" />;
  if (error) return <ErrorMessage message={(error as any)?.message || 'Failed to load user details'} />;
  if (!user) return <ErrorMessage message="User not found" />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.fullName}</h1>
            <p className="text-muted-foreground mt-1">User details and information</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!user.isApproved && (
            <Button
              variant="outline"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve User
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/users/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteMutation.isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {user.fullName}? This action cannot be
                  undone and will remove all user data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* User Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-base">
                  {user.location ? (
                    <>
                      {user.location.name}
                      <Badge variant="outline" className="ml-2">
                        {user.location.type}
                      </Badge>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No location assigned</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Active Status</p>
              {user.isActive ? (
                <Badge variant="default" className="bg-green-500">
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Approval Status
              </p>
              {user.isApproved ? (
                <Badge variant="default" className="bg-blue-500">
                  Approved
                </Badge>
              ) : (
                <Badge variant="secondary">Pending Approval</Badge>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">User ID</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">{user.id}</code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Created At</p>
            <p className="text-base">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleString('en-US', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
            <p className="text-base">
              {user.updatedAt
                ? new Date(user.updatedAt).toLocaleString('en-US', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })
                : '-'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailPage;