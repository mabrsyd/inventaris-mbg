'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MapPin, Warehouse, Building, MoreVertical } from 'lucide-react';
import { useLocations, useDeleteLocation } from '@/lib/hooks/use-master-data';
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

export default function LocationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useLocations({ page, search });
  const deleteMutation = useDeleteLocation();

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const typeCount = (type: string) =>
    data?.data.filter((l: any) => l.type === type).length || 0;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CENTRAL_WAREHOUSE':
        return 'Gudang Pusat';
      case 'REGIONAL_WAREHOUSE':
        return 'Gudang Regional';
      case 'KITCHEN':
        return 'Dapur';
      case 'DISTRIBUTION_POINT':
        return 'Titik Distribusi';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">
              Lokasi Penyimpanan
            </h1>
            <p className="text-slate-600 mt-1">Kelola gudang dan lokasi penyimpanan</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/master-data/locations/new')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Lokasi
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Lokasi</p>
                <p className="text-2xl font-bold text-slate-900">{data?.pagination?.total || 0}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Gudang Pusat</p>
                <p className="text-2xl font-bold text-indigo-600">{typeCount('CENTRAL_WAREHOUSE')}</p>
              </div>
              <Warehouse className="h-8 w-8 text-indigo-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Gudang Regional</p>
                <p className="text-2xl font-bold text-green-600">{typeCount('REGIONAL_WAREHOUSE')}</p>
              </div>
              <Building className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Dapur & Distribusi</p>
                <p className="text-2xl font-bold text-purple-600">
                  {typeCount('KITCHEN') + typeCount('DISTRIBUTION_POINT')}
                </p>
              </div>
              <Building className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>

        <Card className="p-4 bg-white shadow-md">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Cari lokasi..."
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
              <option value="">Semua Tipe</option>
              <option value="CENTRAL_WAREHOUSE">Gudang Pusat</option>
              <option value="REGIONAL_WAREHOUSE">Gudang Regional</option>
              <option value="KITCHEN">Dapur</option>
              <option value="DISTRIBUTION_POINT">Titik Distribusi</option>
            </select>
          </div>
        </Card>

        <Card className="bg-white shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <TableRow>
                <TableHead className="font-semibold">Kode</TableHead>
                <TableHead className="font-semibold">Nama Lokasi</TableHead>
                <TableHead className="font-semibold">Tipe</TableHead>
                <TableHead className="font-semibold">Alamat</TableHead>
                <TableHead className="font-semibold">Manager</TableHead>
                <TableHead className="font-semibold">Kapasitas (kg)</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Tidak ada lokasi ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((location: any) => (
                  <TableRow key={location.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono text-sm text-slate-600">{location.code}</TableCell>
                    <TableCell className="font-medium text-slate-900">{location.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          location.type === 'CENTRAL_WAREHOUSE'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : location.type === 'REGIONAL_WAREHOUSE'
                            ? 'bg-green-50 border-green-300 text-green-700'
                            : location.type === 'KITCHEN'
                            ? 'bg-orange-50 border-orange-300 text-orange-700'
                            : 'bg-purple-50 border-purple-300 text-purple-700'
                        }
                      >
                        {location.type === 'CENTRAL_WAREHOUSE' && <Warehouse className="mr-1 h-3 w-3" />}
                        {location.type === 'REGIONAL_WAREHOUSE' && <Building className="mr-1 h-3 w-3" />}
                        {getTypeLabel(location.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700 max-w-xs truncate">{location.address || '-'}</TableCell>
                    <TableCell className="text-slate-700">{location.managerName || '-'}</TableCell>
                    <TableCell className="text-slate-700">
                      {location.capacityKg ? `${location.capacityKg.toLocaleString()} kg` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={location.isActive ? "default" : "secondary"}>
                        {location.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/master-data/locations/${location.id}`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(location.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            Hapus
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
            <AlertDialogTitle>Hapus Lokasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus lokasi ini? Tindakan ini tidak dapat dibatalkan dan dapat mempengaruhi stok yang tersimpan di sini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}