'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  Package,
  Archive,
  ShoppingCart,
  FileText,
  Factory,
  Truck,
  BarChart3,
  Users,
  Settings,
  Database,
  MapPin,
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    exact: true,
  },
  {
    title: 'Master Data',
    icon: Database,
    children: [
      { title: 'Categories', href: '/dashboard/master-data/categories', icon: Archive },
      { title: 'Locations', href: '/dashboard/master-data/locations', icon: MapPin },
      { title: 'Suppliers', href: '/dashboard/master-data/suppliers', icon: Building2 },
    ],
  },
  {
    title: 'Inventory',
    icon: Package,
    children: [
      { title: 'Items', href: '/dashboard/inventory/items', icon: Package },
      { title: 'Stock', href: '/dashboard/inventory/stock', icon: Archive },
    ],
  },
  {
    title: 'Procurement',
    icon: ShoppingCart,
    children: [
      { title: 'Purchase Orders', href: '/dashboard/procurement/purchase-orders', icon: ShoppingCart },
      { title: 'Goods Receipts', href: '/dashboard/procurement/goods-receipts', icon: FileText },
    ],
  },
  {
    title: 'Production',
    icon: Factory,
    children: [
      { title: 'Recipes', href: '/dashboard/production/recipes', icon: FileText },
      { title: 'Work Orders', href: '/dashboard/production/work-orders', icon: Factory },
    ],
  },
  {
    title: 'Distribution',
    icon: Truck,
    children: [
      { title: 'Beneficiaries', href: '/dashboard/distribution/beneficiaries', icon: Users },
      { title: 'Delivery Orders', href: '/dashboard/distribution/delivery-orders', icon: Truck },
    ],
  },
  {
    title: 'Reports',
    icon: BarChart3,
    children: [
      { title: 'Stock Report', href: '/dashboard/reporting/stock-report', icon: BarChart3 },
      { title: 'Expiry Report', href: '/dashboard/reporting/expiry-report', icon: BarChart3 },
      { title: 'Audit Logs', href: '/dashboard/reporting/audit-logs', icon: FileText },
    ],
  },
  {
    title: 'Users',
    icon: Users,
    href: '/dashboard/users',
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-gray-900">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-white">MBG Inventory</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {menuItems.map((item) => (
                  <li key={item.title}>
                    {!item.children ? (
                      <Link
                        href={item.href!}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                          isActive(item.href!, item.exact)
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.title}
                      </Link>
                    ) : (
                      <div>
                        <button
                          onClick={() => toggleExpanded(item.title)}
                          className={cn(
                            'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                            'text-gray-400 hover:text-white hover:bg-gray-800'
                          )}
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          {item.title}
                          {expandedItems.includes(item.title) ? (
                            <ChevronDown className="ml-auto h-4 w-4" />
                          ) : (
                            <ChevronRight className="ml-auto h-4 w-4" />
                          )}
                        </button>
                        {expandedItems.includes(item.title) && (
                          <ul className="mt-1 space-y-1 pl-6">
                            {item.children.map((child) => (
                              <li key={child.title}>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                                    isActive(child.href)
                                      ? 'bg-gray-800 text-white'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                  )}
                                >
                                  <child.icon className="h-5 w-5 shrink-0" />
                                  {child.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;