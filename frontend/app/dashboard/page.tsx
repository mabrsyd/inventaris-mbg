'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  ShoppingCart, 
  Factory, 
  Truck, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { useDashboardStats, useLowStockAlerts } from '@/lib/hooks/use-reports';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: alerts, isLoading: alertsLoading } = useLowStockAlerts();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-slate-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Items */}
          <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-all border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-600 font-medium">Total Items</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold text-slate-900">{stats?.inventory.totalItems || 0}</p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-4 text-blue-600 hover:text-blue-700 p-0"
              onClick={() => router.push('/dashboard/inventory/items')}
            >
              View Items <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Card>

          {/* Total Stock Value */}
          <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-all border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-600 font-medium">Stock Value</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-3xl font-bold text-slate-900">
                    ${stats?.inventory.totalStockValue?.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>In stock</span>
            </div>
          </Card>

          {/* Low Stock Items */}
          <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-all border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-600 font-medium">Low Stock</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-3xl font-bold text-orange-600">{stats?.inventory.lowStockItems || 0}</p>
                )}
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600">
              <TrendingDown className="mr-1 h-4 w-4" />
              <span>Needs attention</span>
            </div>
          </Card>

          {/* Out of Stock */}
          <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-all border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-600 font-medium">Out of Stock</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-3xl font-bold text-red-600">{stats?.inventory.outOfStockItems || 0}</p>
                )}
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600">
              <span>Critical</span>
            </div>
          </Card>
        </div>

        {/* Module Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Procurement */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Procurement</h3>
            </div>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Pending POs</span>
                  <Badge variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-700">
                    {stats?.procurement.pendingPurchaseOrders || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Purchase Value</span>
                  <span className="text-sm font-semibold">
                    ${(stats?.procurement.totalPurchaseValue || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 w-full"
              onClick={() => router.push('/dashboard/procurement/purchase-orders')}
            >
              View Orders
            </Button>
          </Card>

          {/* Production */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Factory className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Production</h3>
            </div>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Active Work Orders</span>
                  <Badge variant="outline" className="bg-purple-50 border-purple-300 text-purple-700">
                    {stats?.production.activeWorkOrders || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Completed This Month</span>
                  <span className="text-sm font-semibold">{stats?.production.completedThisMonth || 0}</span>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 w-full"
              onClick={() => router.push('/dashboard/production/work-orders')}
            >
              View Production
            </Button>
          </Card>

          {/* Distribution */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Distribution</h3>
            </div>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Pending Deliveries</span>
                  <Badge variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-700">
                    {stats?.distribution.pendingDeliveries || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Beneficiaries</span>
                  <span className="text-sm font-semibold">{stats?.distribution.totalBeneficiaries || 0}</span>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 w-full"
              onClick={() => router.push('/dashboard/distribution/delivery-orders')}
            >
              View Deliveries
            </Button>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        <Card className="bg-white shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Low Stock Alerts</h2>
                  <p className="text-sm text-slate-600">Items that need reordering</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard/inventory/items')}
              >
                View All Items
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            {alertsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((item: any) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Package className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-600">{item.category?.name || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Current Stock</p>
                        <p className="font-semibold text-orange-600">{item.quantity} units</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Reorder Point</p>
                        <p className="font-semibold text-slate-900">{item.reorderPoint} units</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          item.quantity === 0 
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : 'bg-orange-50 border-orange-300 text-orange-700'
                        }
                      >
                        {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>All items are well stocked! 🎉</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="p-4 bg-white hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => router.push('/dashboard/procurement/purchase-orders/new')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Create Purchase Order</p>
                <p className="text-xs text-slate-600">New procurement</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 bg-white hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => router.push('/dashboard/production/work-orders/new')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Factory className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Create Work Order</p>
                <p className="text-xs text-slate-600">New production</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 bg-white hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => router.push('/dashboard/distribution/delivery-orders/new')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Create Delivery Order</p>
                <p className="text-xs text-slate-600">New distribution</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 bg-white hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => router.push('/dashboard/inventory/items/new')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Package className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Add New Item</p>
                <p className="text-xs text-slate-600">Inventory item</p>
              </div>
            </div>
          </Card>
        </div>

    </div>
  );
}
