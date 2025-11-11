import { prisma } from '../../../database';
import { NotFoundError, ConflictError } from '../../../core/errors';
import { getPaginationParams } from '../../../app/utils';

export interface CreateRecipeDto {
  code?: string;
  name: string;
  description?: string;
  portionSize: number;
  preparationTime?: number;
  cookingTime?: number;
  instructions?: string;
  nutritionalInfo?: any;
  ingredients: Array<{
    itemId: string;
    quantity: number;
    unit: string;
  }>;
}

export interface UpdateRecipeDto {
  name?: string;
  description?: string;
  portionSize?: number;
  preparationTime?: number;
  cookingTime?: number;
  instructions?: string;
  nutritionalInfo?: any;
  isActive?: boolean;
  ingredients?: Array<{
    itemId: string;
    quantity: number;
    unit: string;
  }>;
}

export class RecipeService {
  async createRecipe(data: CreateRecipeDto, creatorId: string) {
    // Check unique name
    const existing = await prisma.recipe.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictError('Nama resep sudah ada');
    }

    if (data.code) {
      const existingCode = await prisma.recipe.findUnique({
        where: { code: data.code },
      });

      if (existingCode) {
        throw new ConflictError('Kode resep sudah ada');
      }
    }

    // Calculate total cost
    let totalCost = 0;
    const ingredients = [];

    for (const ing of data.ingredients) {
      const item = await prisma.item.findUnique({
        where: { id: ing.itemId },
      });

      if (!item || !item.isActive) {
        throw new ConflictError(`Item ${ing.itemId} tidak valid`);
      }

      const cost = item.price * ing.quantity;
      totalCost += cost;

      ingredients.push({
        itemId: ing.itemId,
        quantity: ing.quantity,
        unit: ing.unit as any,
        cost,
      });
    }

    const costPerPortion = totalCost / data.portionSize;

    const recipe = await prisma.recipe.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        portionSize: data.portionSize,
        totalCost,
        costPerPortion,
        preparationTime: data.preparationTime,
        cookingTime: data.cookingTime,
        instructions: data.instructions,
        nutritionalInfo: data.nutritionalInfo,
        recipeItems: {
          create: ingredients,
        },
      },
      include: {
        recipeItems: {
          include: {
            item: {
              select: {
                id: true,
                sku: true,
                name: true,
                unit: true,
                price: true,
                description: true,
              },
            },
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_RECIPE',
        actionType: 'CREATE',
        entityType: 'Recipe',
        entityId: recipe.id,
        userId: creatorId,
        newValues: { name: recipe.name } as any,
      },
    });

    // Map recipeItems to ingredients format for frontend compatibility
    return {
      ...recipe,
      ingredients: recipe.recipeItems.map(ri => ({
        itemId: ri.itemId,
        quantity: ri.quantity,
        unit: ri.unit,
      })),
    };
  }

  async getRecipes(query: any) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};

    if (query.isActive !== undefined) where.isActive = query.isActive;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        include: {
          recipeItems: {
            include: {
              item: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  unit: true,
                  price: true,
                },
              },
            },
          },
          _count: {
            select: { recipeItems: true, workOrders: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.recipe.count({ where }),
    ]);

    // Map each recipe's recipeItems to ingredients format
    const recipesWithIngredients = recipes.map(recipe => ({
      ...recipe,
      items: recipe.recipeItems,
      ingredients: recipe.recipeItems.map(ri => ({
        itemId: ri.itemId,
        quantity: ri.quantity,
        unit: ri.unit,
      })),
    }));

    return { recipes: recipesWithIngredients, total, page, limit };
  }

  async getRecipeById(id: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        recipeItems: {
          include: {
            item: {
              select: {
                id: true,
                sku: true,
                name: true,
                unit: true,
                price: true,
                description: true,
              },
            },
          },
        },
        workOrders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            woNumber: true,
            status: true,
            plannedQuantity: true,
            actualQuantity: true,
            scheduledDate: true,
          },
        },
        _count: {
          select: { workOrders: true },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundError('Resep tidak ditemukan');
    }

    // Map recipeItems to ingredients format for frontend compatibility
    return {
      ...recipe,
      ingredients: recipe.recipeItems.map(ri => ({
        itemId: ri.itemId,
        quantity: ri.quantity,
        unit: ri.unit,
      })),
    };
  }

  async updateRecipe(id: string, data: UpdateRecipeDto, updaterId: string) {
    const existing = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Resep tidak ditemukan');
    }

    let updateData: any = {
      name: data.name,
      description: data.description,
      portionSize: data.portionSize,
      preparationTime: data.preparationTime,
      cookingTime: data.cookingTime,
      instructions: data.instructions,
      nutritionalInfo: data.nutritionalInfo,
      isActive: data.isActive,
    };

    // Update ingredients if provided
    if (data.ingredients && data.ingredients.length > 0) {
      await prisma.recipeItem.deleteMany({
        where: { recipeId: id },
      });

      let totalCost = 0;
      const ingredients = [];

      for (const ing of data.ingredients) {
        const item = await prisma.item.findUnique({
          where: { id: ing.itemId },
        });

        if (!item) {
          throw new ConflictError(`Item ${ing.itemId} tidak valid`);
        }

        const cost = item.price * ing.quantity;
        totalCost += cost;

        ingredients.push({
          itemId: ing.itemId,
          quantity: ing.quantity,
          unit: ing.unit as any,
          cost,
        });
      }

      const portionSize = data.portionSize || existing.portionSize;
      updateData.totalCost = totalCost;
      updateData.costPerPortion = totalCost / portionSize;
      updateData.recipeItems = {
        create: ingredients,
      };
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: updateData,
      include: {
        recipeItems: {
          include: {
            item: {
              select: {
                id: true,
                sku: true,
                name: true,
                unit: true,
                price: true,
                description: true,
              },
            },
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_RECIPE',
        actionType: 'UPDATE',
        entityType: 'Recipe',
        entityId: id,
        userId: updaterId,
        newValues: data as any,
      },
    });

    // Map recipeItems to ingredients format for frontend compatibility
    return {
      ...recipe,
      ingredients: recipe.recipeItems.map(ri => ({
        itemId: ri.itemId,
        quantity: ri.quantity,
        unit: ri.unit,
      })),
    };
  }

  async deleteRecipe(id: string, deleterId: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        _count: {
          select: { workOrders: true },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundError('Resep tidak ditemukan');
    }

    if (recipe._count.workOrders > 0) {
      throw new ConflictError('Resep tidak dapat dihapus karena memiliki work order');
    }

    await prisma.recipe.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_RECIPE',
        actionType: 'DELETE',
        entityType: 'Recipe',
        entityId: id,
        userId: deleterId,
        oldValues: { name: recipe.name } as any,
      },
    });

    return { message: 'Resep berhasil dihapus' };
  }
}
