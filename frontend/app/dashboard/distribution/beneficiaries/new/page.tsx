"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import BeneficiaryForm from '@/components/forms/beneficiary-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NewBeneficiaryPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/distribution/beneficiaries');
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Beneficiary</CardTitle>
        </CardHeader>
        <CardContent>
          <BeneficiaryForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewBeneficiaryPage;