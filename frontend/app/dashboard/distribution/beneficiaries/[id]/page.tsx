"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBeneficiaryById } from '@/lib/api/distribution';
import { Beneficiary } from '@/lib/types/distribution';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BeneficiaryDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchBeneficiary = async () => {
        try {
          const response = await getBeneficiaryById(id);
          setBeneficiary(response.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch beneficiary details');
        } finally {
          setLoading(false);
        }
      };

      fetchBeneficiary();
    }
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" className="my-8" />;
  if (error) return <ErrorMessage message={error} />;
  if (!beneficiary) return <ErrorMessage message="No beneficiary found" />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{beneficiary.name}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Beneficiary Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Code</p>
              <p className="font-medium">{beneficiary.code || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <Badge>{beneficiary.type}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Person</p>
              <p className="font-medium">{beneficiary.contactPerson || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{beneficiary.phone || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{beneficiary.address || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Target Quota</p>
              <p className="font-medium">{beneficiary.targetQuota || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant={beneficiary.isActive ? "default" : "destructive"}>
                {beneficiary.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BeneficiaryDetailPage;