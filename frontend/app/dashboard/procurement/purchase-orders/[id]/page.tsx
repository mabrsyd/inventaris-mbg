"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  usePurchaseOrder, 
  useApprovePurchaseOrder, 
  useSubmitPurchaseOrder,
  useUpdatePurchaseOrder
} from '@/lib/hooks/use-procurement';
import { useSuppliers, useLocations } from '@/lib/hooks/use-master-data';
import { useItems } from '@/lib/hooks/use-items';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, CheckCircle, Edit, Send, Save, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

// Schema for PO item
const poItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be at least 0'),
});

// Schema for the entire PO form
const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  destinationLocationId: z.string().min(1, 'Destination location is required'),
  expectedDeliveryDate: z.string().min(1, 'Expected delivery date is required'),
  notes: z.string().optional(),
  status: z.string().optional(),
  items: z.array(poItemSchema).min(1, 'At least one item is required'),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: po, isLoading } = usePurchaseOrder(id);
  const approveMutation = useApprovePurchaseOrder();
  const submitMutation = useSubmitPurchaseOrder();

  const handleApprove = () => {
    if (po?.data && po.data.status === 'PENDING_APPROVAL') {
      approveMutation.mutate(po.data.id);
    }
  };

  const handleSubmit = () => {
    if (po?.data && po.data.status === 'DRAFT') {
      submitMutation.mutate(po.data.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      APPROVED: 'bg-blue-100 text-blue-800 border-blue-300',
      COMPLETED: 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!po?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">Purchase Order not found</p>
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const purchase = po.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
              Purchase Order {purchase.poNumber}
            </h1>
            <p className="text-slate-600 mt-1">
              Created on {formatDate(purchase.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={getStatusBadge(purchase.status)}>
              {purchase.status}
            </Badge>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/dashboard/procurement/purchase-orders')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        {(purchase.status === 'DRAFT' || purchase.status === 'PENDING_APPROVAL') && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Actions Available</p>
                  <p className="text-sm text-slate-600">
                    {purchase.status === 'DRAFT' 
                      ? 'You can edit or submit this purchase order for approval'
                      : 'This purchase order is pending approval'}
                  </p>
                </div>
                <div className="flex gap-3">
                  {purchase.status === 'DRAFT' && (
                    <>
                      <Button 
                        onClick={() => router.push(`/dashboard/procurement/purchase-orders/${purchase.id}/edit`)}
                        variant="outline"
                        className="bg-white hover:bg-slate-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={submitMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit for Approval
                      </Button>
                    </>
                  )}

                  {purchase.status === 'PENDING_APPROVAL' && (
                    <Button 
                      onClick={handleApprove} 
                      disabled={approveMutation.isPending}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="text-xl font-semibold text-slate-800">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">PO Number</label>
              <p className="text-lg font-semibold text-slate-900 mt-1">{purchase.poNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Status</label>
              <div className="mt-1">
                <Badge className={getStatusBadge(purchase.status)}>
                  {purchase.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Supplier</label>
              <p className="text-lg text-slate-900 mt-1">{purchase.supplier?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Destination Location</label>
              <p className="text-lg text-slate-900 mt-1">{purchase.destinationLocation?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Expected Delivery</label>
              <p className="text-lg text-slate-900 mt-1">
                {purchase.expectedDeliveryDate ? formatDate(purchase.expectedDeliveryDate) : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Amount</label>
              <p className="text-lg font-bold text-indigo-700 mt-1">Rp {(purchase.totalAmount || 0).toLocaleString('id-ID')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Items ({purchase.items?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {purchase.items && purchase.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Item</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Quantity</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Unit Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-900">{item.item?.name}</p>
                            <p className="text-sm text-slate-600">SKU: {item.item?.sku}</p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-slate-900">
                          {item.quantity} {item.item?.unit}
                        </td>
                        <td className="text-right py-3 px-4 text-slate-900">
                          Rp {(item.unitPrice || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-slate-900">
                          Rp {(item.totalPrice || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-300 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <td colSpan={3} className="py-3 px-4 font-semibold text-slate-800">Total</td>
                      <td className="text-right py-3 px-4 font-bold text-lg text-indigo-700">
                        Rp {(purchase.totalAmount || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No items in this purchase order</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {purchase.notes && (
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <CardTitle className="text-xl font-semibold text-slate-800">Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="whitespace-pre-wrap text-slate-700">{purchase.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Goods Receipts */}
        {(purchase as any).goodsReceipts && (purchase as any).goodsReceipts.length > 0 && (
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-xl font-semibold text-slate-800">Related Goods Receipts</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {(purchase as any).goodsReceipts.map((gr: any) => (
                  <div key={gr.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-semibold text-slate-900">{gr.receiptNumber}</p>
                      <p className="text-sm text-slate-600">
                        Received: {formatDate(gr.receivedDate)}
                      </p>
                    </div>
                    <Badge variant={gr.qcStatus === 'PASSED' ? 'default' : 'secondary'}>
                      QC: {gr.qcStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}