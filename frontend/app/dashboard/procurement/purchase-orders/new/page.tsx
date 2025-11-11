"use client"

import { useRouter } from 'next/navigation';
import PurchaseOrderForm from '@/components/forms/purchase-order-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NewPurchaseOrderPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
              Buat Purchase Order
            </h1>
            <p className="text-slate-600 mt-1">
              Buat purchase order baru untuk pembelian barang
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Detail Purchase Order
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <PurchaseOrderForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewPurchaseOrderPage;