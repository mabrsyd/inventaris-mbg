import React from 'react';
import { Card } from '@/components/ui/card';

interface RecipeDetailsProps {
  recipe: {
    id: string;
    name: string;
    description?: string;
    outputQuantity: number;
    preparationTimeMinutes?: number;
    cookingTimeMinutes?: number;
    instructions?: string;
    ingredients?: Array<{
      id: string;
      itemId: string;
      quantity: number;
      item?: {
        name: string;
        unit: string;
      };
    }>;
  };
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe }) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">{recipe.name}</h2>
        {recipe.description && (
          <p className="text-gray-600 mb-4">{recipe.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="font-semibold">Output Quantity:</span> {recipe.outputQuantity}
          </div>
          {recipe.preparationTimeMinutes && (
            <div>
              <span className="font-semibold">Preparation Time:</span> {recipe.preparationTimeMinutes} minutes
            </div>
          )}
          {recipe.cookingTimeMinutes && (
            <div>
              <span className="font-semibold">Cooking Time:</span> {recipe.cookingTimeMinutes} minutes
            </div>
          )}
        </div>

        {recipe.instructions && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Instructions</h3>
            <p className="whitespace-pre-wrap">{recipe.instructions}</p>
          </div>
        )}

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient.id} className="flex justify-between">
                  <span>{ingredient.item?.name || 'Unknown Item'}</span>
                  <span className="font-semibold">
                    {ingredient.quantity} {ingredient.item?.unit || ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RecipeDetails;
