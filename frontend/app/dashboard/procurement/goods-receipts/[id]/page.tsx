"use client"

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, CheckCircle, XCircle, AlertCircle, Edit, Loader2 } from 'lucide-react';
import { useGoodsReceipt, useUpdateGoodsReceiptQC } from '@/lib/hooks/use-procurement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils/date';
import { toast } from '@/lib/hooks/use-toast';

const GoodsReceiptDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const { data: goodsReceipt, isLoading, error } = useGoodsReceipt(id);
  const updateQCMutation = useUpdateGoodsReceiptQC();
  
  const [isEditingQC, setIsEditingQC] = useState(false);
  const [qcStatus, setQcStatus] = useState<'PENDING' | 'PASSED' | 'FAILED'>('PENDING');
  const [qcNotes, setQcNotes] = useState('');

  const handleUpdateQC = async () => {
    try {
      await updateQCMutation.mutateAsync({
        id,
        qcStatus,
        qcNotes,
        qcDate: new Date().toISOString().split('T')[0],
      });
      
      toast({
        title: 'Success',
        description: 'QC status updated successfully',
      });
      
      setIsEditingQC(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update QC status',
        variant: 'destructive',
      });
    }
  };

  const getQcBadge = (status: string) => {
    const styles = {
      PASSED: 'bg-green-100 text-green-800 border-green-300',
      FAILED: 'bg-red-100 text-red-800 border-red-300',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getQcIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="h-4 w-4" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Goods Receipt</h2>
                <p className="text-red-600 mb-4">
                  {error instanceof Error ? error.message : 'Failed to fetch goods receipt details'}
                </p>
                <Button onClick={() => router.back()} variant="outline">
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

  if (!goodsReceipt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Goods Receipt Not Found</h2>
                <p className="text-slate-600 mb-4">The requested goods receipt could not be found.</p>
                <Button onClick={() => router.back()} variant="outline">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
              Goods Receipt #{goodsReceipt.data.receiptNumber}
            </h1>
            <p className="text-slate-600 mt-1">View and manage goods receipt details</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/procurement/goods-receipts')}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="text-xl font-semibold text-slate-800">Receipt Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Receipt Number</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{goodsReceipt.data.receiptNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Purchase Order</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{goodsReceipt.data.purchaseOrder?.poNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Location</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{goodsReceipt.data.location?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Received Date</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {formatDate(goodsReceipt.data.receivedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">QC Status</p>
                  <div className="mt-1">
                    <Badge className={getQcBadge(goodsReceipt.data.qcStatus)}>
                      <span className="flex items-center gap-1">
                        {getQcIcon(goodsReceipt.data.qcStatus)}
                        {goodsReceipt.data.qcStatus}
                      </span>
                    </Badge>
                  </div>
                </div>
                {goodsReceipt.data.qcNotes && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">QC Notes</p>
                    <p className="text-lg font-semibold text-slate-900 mt-1">{goodsReceipt.data.qcNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {goodsReceipt.data.items && goodsReceipt.data.items.length > 0 && (
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <CardTitle className="text-xl font-semibold text-slate-800">Items Received</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Item Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Batch Number</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goodsReceipt.data.items.map((item: any) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">{item.item?.name || 'Unknown Item'}</td>
                        <td className="py-3 px-4 text-slate-700">{item.quantity}</td>
                        <td className="py-3 px-4 text-slate-700">{item.batchNumber || '-'}</td>
                        <td className="py-3 px-4 text-slate-700">
                          {item.expiryDate ? formatDate(item.expiryDate) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QC Status Update Card */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Quality Control Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!isEditingQC ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Current QC Status</p>
                    <Badge className={getQcBadge(goodsReceipt.data.qcStatus)}>
                      <span className="flex items-center gap-1">
                        {getQcIcon(goodsReceipt.data.qcStatus)}
                        {goodsReceipt.data.qcStatus}
                      </span>
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => {
                      setIsEditingQC(true);
                      setQcStatus(goodsReceipt.data.qcStatus);
                      setQcNotes(goodsReceipt.data.qcNotes || '');
                    }}
                    variant="outline"
                    className="hover:bg-green-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update QC Status
                  </Button>
                </div>
                {goodsReceipt.data.qcNotes && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">QC Notes</p>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded">{goodsReceipt.data.qcNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    QC Status *
                  </label>
                  <Select value={qcStatus} onValueChange={(value: any) => setQcStatus(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">
                        <span className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          PENDING
                        </span>
                      </SelectItem>
                      <SelectItem value="PASSED">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          PASSED
                        </span>
                      </SelectItem>
                      <SelectItem value="FAILED">
                        <span className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          FAILED
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    QC Notes
                  </label>
                  <Textarea
                    value={qcNotes}
                    onChange={(e) => setQcNotes(e.target.value)}
                    placeholder="Enter quality control notes (optional)"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingQC(false);
                      setQcStatus(goodsReceipt.data.qcStatus);
                      setQcNotes(goodsReceipt.data.qcNotes || '');
                    }}
                    disabled={updateQCMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateQC}
                    disabled={updateQCMutation.isPending}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {updateQCMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save QC Status
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => router.push(`/dashboard/procurement/goods-receipts/${goodsReceipt.data.id}/edit`)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Receipt
          </Button>
        </div>

      </div>
    </div>
  );
};

export default GoodsReceiptDetailPage;