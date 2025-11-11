"use client"

import { useParams } from 'next/navigation';
import { useLocation } from '@/lib/hooks/use-master-data';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LocationForm from '@/components/forms/location-form';

const LocationEditPage = () => {
  const params = useParams();
  const id = params?.id as string;
  
  const { data: location, isLoading, error } = useLocation(id);

  if (isLoading) return <LoadingSpinner size="lg" className="my-8" />;
  if (error) return <ErrorMessage message="Failed to fetch location details" />;
  if (!location) return <ErrorMessage message="Location not found" />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Lokasi</h1>
        <p className="text-muted-foreground mt-1">
          Perbarui informasi lokasi
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Lokasi</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationForm
            initialData={{
              id: location.id,
              code: location.code,
              name: location.name,
              type: location.type,
              address: location.address || '',
              phone: location.phone || '',
              managerName: location.managerName || '',
              capacityKg: location.capacityKg || 0,
              isActive: location.isActive,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationEditPage;