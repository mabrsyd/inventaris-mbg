'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Users, User, Building2, MoreVertical } from 'lucide-react';
import {
  useBeneficiaries,
  useDeleteBeneficiary,
} from '@/lib/hooks/use-distribution';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function BeneficiariesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useBeneficiaries({ page, search, type: typeFilter });
  const deleteMutation = useDeleteBeneficiary();

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const typeCount = (type: string) =>
    data?.data.filter((b: any) => b.type === type).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-900 to-cyan-700 bg-clip-text text-transparent">
              Beneficiaries
            </h1>
            <p className="text-slate-600 mt-1">Manage distribution beneficiaries and recipients</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/distribution/beneficiaries/new')}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Beneficiary
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-teal-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Beneficiaries</p>
                <p className="text-2xl font-bold text-slate-900">{data?.pagination?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-teal-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Individuals</p>
                <p className="text-2xl font-bold text-cyan-600">{typeCount('INDIVIDUAL')}</p>
              </div>
              <User className="h-8 w-8 text-cyan-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-slate-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Organizations</p>
                <p className="text-2xl font-bold text-slate-900">{typeCount('ORGANIZATION')}</p>
              </div>
              <Building2 className="h-8 w-8 text-slate-500" />
            </div>
          </Card>
        </div>

        <Card className="p-4 bg-white shadow-md">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search beneficiaries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="">All Types</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="ORGANIZATION">Organization</option>
            </select>
          </div>
        </Card>

        <Card className="bg-white shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Contact Person</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Address</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No beneficiaries found
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((beneficiary: any) => (
                  <TableRow key={beneficiary.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-900">{beneficiary.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          beneficiary.type === 'INDIVIDUAL'
                            ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
                            : 'bg-slate-100 border-slate-300 text-slate-700'
                        }
                      >
                        {beneficiary.type === 'INDIVIDUAL' ? (
                          <><User className="mr-1 h-3 w-3" /> Individual</>
                        ) : (
                          <><Building2 className="mr-1 h-3 w-3" /> Organization</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">{beneficiary.contactPerson || '-'}</TableCell>
                    <TableCell className="text-slate-700">{beneficiary.phone || '-'}</TableCell>
                    <TableCell className="text-slate-600">{beneficiary.email || '-'}</TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">
                      {beneficiary.address || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/distribution/beneficiaries/${beneficiary.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/distribution/beneficiaries/${beneficiary.id}/edit`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(beneficiary.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {data && data.pagination && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= data.pagination.totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}

      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Beneficiary</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this beneficiary? This action cannot be undone and may affect existing delivery orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
