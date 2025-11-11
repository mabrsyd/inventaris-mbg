import { prisma } from '../../database';

export class ReportService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalItems,
      activeItems,
      stocks,
      pendingPOs,
      totalPurchaseValue,
      activeWorkOrders,
      completedWorkOrders,
      pendingDeliveries,
      totalBeneficiaries,
    ] = await Promise.all([
      // Inventory stats
      prisma.item.count(),
      prisma.item.count({ where: { isActive: true } }),
      prisma.stock.findMany({
        include: { item: { select: { id: true, price: true, reorderPoint: true } } },
      }),

      // Procurement stats
      prisma.purchaseOrder.count({
        where: { status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED'] } },
      }),
      prisma.purchaseOrder.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),

      // Production stats
      prisma.workOrder.count({
        where: { status: 'IN_PROGRESS' },
      }),
      prisma.workOrder.count({
        where: {
          status: 'COMPLETED',
          completionDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Distribution stats
      prisma.deliveryOrder.count({
        where: { status: { in: ['PENDING', 'IN_TRANSIT'] } },
      }),
      prisma.beneficiary.count({ where: { isActive: true } }),
    ]);

    // Calculate stock value and alerts
    let totalStockValue = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;

    const itemStockMap = new Map<string, number>();
    stocks.forEach((stock) => {
      const current = itemStockMap.get(stock.itemId) || 0;
      itemStockMap.set(stock.itemId, current + stock.quantity);
      totalStockValue += stock.quantity * (stock.item.price || 0);
    });

    // Check against reorder points
    const items = await prisma.item.findMany({
      where: { isActive: true },
      select: { id: true, reorderPoint: true },
    });

    items.forEach((item) => {
      const totalStock = itemStockMap.get(item.id) || 0;
      if (totalStock === 0) {
        outOfStockItems++;
      } else if (totalStock <= item.reorderPoint) {
        lowStockItems++;
      }
    });

    return {
      inventory: {
        totalItems: activeItems,
        totalStockValue,
        lowStockItems,
        outOfStockItems,
      },
      procurement: {
        pendingPurchaseOrders: pendingPOs,
        totalPurchaseValue: totalPurchaseValue._sum.totalAmount || 0,
        pendingGoodsReceipts: 0,
      },
      production: {
        activeWorkOrders,
        completedThisMonth: completedWorkOrders,
        totalProduction: 0,
      },
      distribution: {
        pendingDeliveries,
        completedThisMonth: 0,
        totalBeneficiaries,
      },
    };
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts() {
    const items = await prisma.item.findMany({
      where: { isActive: true },
      include: {
        category: true,
        stock: {
          include: { location: true },
        },
      },
    });

    const alerts = items
      .map((item) => {
        const totalStock = item.stock.reduce((sum, s) => sum + s.quantity, 0);
        const locations = item.stock
          .filter((s) => s.quantity > 0)
          .map((s) => s.location.name);

        return {
          itemId: item.id,
          itemName: item.name,
          itemCode: item.code || item.sku,
          currentStock: totalStock,
          reorderPoint: item.reorderPoint,
          deficit: item.reorderPoint - totalStock,
          locations,
          category: item.category,
          needsReorder: totalStock <= item.reorderPoint,
        };
      })
      .filter((item) => item.needsReorder)
      .sort((a, b) => b.deficit - a.deficit);

    return alerts;
  }

  /**
   * Get stock report
   */
  async getStockReport(params: {
    locationId?: string;
    categoryId?: string;
    lowStockOnly?: boolean;
  }) {
    const where: any = {};

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    const items = await prisma.item.findMany({
      where: { ...where, isActive: true },
      include: {
        stock: {
          where: params.locationId ? { locationId: params.locationId } : {},
          include: { location: true },
        },
      },
    });

    const report = items
      .map((item) => {
        const totalQuantity = item.stock.reduce((sum, s) => sum + s.quantity, 0);
        return {
          itemId: item.id,
          itemName: item.name,
          itemCode: item.code || item.sku,
          totalQuantity,
          locationBreakdown: item.stock.map((s) => ({
            locationId: s.locationId,
            locationName: s.location.name,
            quantity: s.quantity,
          })),
          reorderPoint: item.reorderPoint,
          needsReorder: totalQuantity <= item.reorderPoint,
        };
      })
      .filter((item) => {
        if (params.lowStockOnly) {
          return item.needsReorder;
        }
        return true;
      });

    return report;
  }

  /**
   * Get transaction report (stock ledger)
   */
  async getTransactionReport(params: {
    startDate: Date;
    endDate: Date;
    type?: string;
    itemId?: string;
    locationId?: string;
  }) {
    const where: any = {
      createdAt: {
        gte: params.startDate,
        lte: params.endDate,
      },
    };

    if (params.type) where.mutationType = params.type;
    if (params.itemId) where.itemId = params.itemId;
    if (params.locationId) where.locationId = params.locationId;

    const transactions = await prisma.stockLedger.findMany({
      where,
      include: {
        item: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => ({
      date: t.createdAt,
      type: t.mutationType,
      referenceId: t.referenceId || '',
      itemName: t.item.name,
      quantity: t.change,
      location: t.location?.name || 'N/A',
    }));
  }

  /**
   * Get procurement report
   */
  async getProcurementReport(params: {
    startDate: Date;
    endDate: Date;
    supplierId?: string;
  }) {
    const where: any = {
      documentDate: {
        gte: params.startDate,
        lte: params.endDate,
      },
    };

    if (params.supplierId) where.supplierId = params.supplierId;

    const orders = await prisma.purchaseOrder.findMany({
      where,
      include: { supplier: true },
    });

    const supplierMap = new Map();
    orders.forEach((order) => {
      const supplierId = order.supplierId;
      if (!supplierMap.has(supplierId)) {
        supplierMap.set(supplierId, {
          supplierId,
          supplierName: order.supplier.name,
          totalOrders: 0,
          totalAmount: 0,
          pendingOrders: 0,
          completedOrders: 0,
        });
      }

      const stat = supplierMap.get(supplierId);
      stat.totalOrders++;
      stat.totalAmount += order.totalAmount || 0;
      if (order.status === 'RECEIVED') stat.completedOrders++;
      else if (order.status !== 'CANCELLED') stat.pendingOrders++;
    });

    return Array.from(supplierMap.values());
  }

  /**
   * Get production report
   */
  async getProductionReport(params: {
    startDate: Date;
    endDate: Date;
    recipeId?: string;
  }) {
    const where: any = {
      createdAt: {
        gte: params.startDate,
        lte: params.endDate,
      },
    };

    if (params.recipeId) where.recipeId = params.recipeId;

    const workOrders = await prisma.workOrder.findMany({
      where,
      include: { recipe: true },
    });

    const recipeMap = new Map();
    workOrders.forEach((wo) => {
      const recipeId = wo.recipeId;
      if (!recipeMap.has(recipeId)) {
        recipeMap.set(recipeId, {
          recipeId,
          recipeName: wo.recipe.name,
          totalProduced: 0,
          totalWorkOrders: 0,
          completedWorkOrders: 0,
        });
      }

      const stat = recipeMap.get(recipeId);
      stat.totalWorkOrders++;
      if (wo.status === 'COMPLETED') {
        stat.completedWorkOrders++;
        stat.totalProduced += wo.actualQuantity || 0;
      }
    });

    return Array.from(recipeMap.values());
  }

  /**
   * Get distribution report
   */
  async getDistributionReport(params: {
    startDate: Date;
    endDate: Date;
    beneficiaryId?: string;
  }) {
    const where: any = {
      createdAt: {
        gte: params.startDate,
        lte: params.endDate,
      },
    };

    if (params.beneficiaryId) where.beneficiaryId = params.beneficiaryId;

    const deliveries = await prisma.deliveryOrder.findMany({
      where,
      include: { beneficiary: true, items: true },
    });

    const beneficiaryMap = new Map();
    deliveries.forEach((delivery) => {
      if (!delivery.beneficiaryId) return;

      const beneficiaryId = delivery.beneficiaryId;
      if (!beneficiaryMap.has(beneficiaryId)) {
        beneficiaryMap.set(beneficiaryId, {
          beneficiaryId,
          beneficiaryName: delivery.beneficiary?.name || 'Unknown',
          totalDeliveries: 0,
          totalItemsDelivered: 0,
          pendingDeliveries: 0,
          completedDeliveries: 0,
        });
      }

      const stat = beneficiaryMap.get(beneficiaryId);
      stat.totalDeliveries++;
      stat.totalItemsDelivered += delivery.items.length;
      if (delivery.status === 'DELIVERED') stat.completedDeliveries++;
      else if (delivery.status !== 'CANCELLED') stat.pendingDeliveries++;
    });

    return Array.from(beneficiaryMap.values());
  }

  /**
   * Export report to CSV
   */
  async exportReportToCSV(reportType: string, params: any): Promise<string> {
    let data: any[] = [];
    let headers: string[] = [];

    switch (reportType) {
      case 'stock':
        data = await this.getStockReport(params);
        headers = ['Item Code', 'Item Name', 'Total Quantity', 'Reorder Point', 'Status'];
        break;
      case 'procurement':
        data = await this.getProcurementReport(params);
        headers = ['Supplier', 'Total Orders', 'Total Amount', 'Pending', 'Completed'];
        break;
      case 'production':
        data = await this.getProductionReport(params);
        headers = ['Recipe', 'Total Work Orders', 'Completed', 'Total Produced'];
        break;
      case 'distribution':
        data = await this.getDistributionReport(params);
        headers = ['Beneficiary', 'Total Deliveries', 'Items Delivered', 'Pending', 'Completed'];
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }

    // Convert to CSV
    const csvRows = [headers.join(',')];
    data.forEach((row) => {
      const values = Object.values(row).map((val) =>
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      );
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
}
