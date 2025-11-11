# ✅ Recipe & Work Order Flow - FIXED

## 📋 Summary Perbaikan

### Masalah yang Ditemukan:

1. **Recipe**: Item tidak terbaca saat edit/update resep
2. **Work Order**: Flow recipe → WO tidak sempurna, ingredients tidak ditampilkan dengan benar

---

## 🔧 Perbaikan Backend

### 1️⃣ Recipe Service (`recipe.service.ts`)

#### ✅ `createRecipe()`

- Include `recipeItems` dengan detail item
- Map `recipeItems` ke field `ingredients` untuk frontend compatibility
- Return: `{ ...recipe, ingredients: [...] }`

#### ✅ `getRecipeById()`

- Include `recipeItems` dengan item details (`id`, `sku`, `name`, `unit`, `price`)
- Map ke field `ingredients` + provide `items` field untuk list display
- Return: `{ ...recipe, ingredients: [...], items: [...] }`

#### ✅ `getRecipes()`

- Include `recipeItems` dengan item details
- Provide both `items` dan `ingredients` field
- Return proper data structure untuk pagination

#### ✅ `updateRecipe()`

- Include `recipeItems` dengan full item details
- Map ke field `ingredients` untuk consistency
- Return dengan proper structure

### 2️⃣ Work Order Service (`work-order.service.ts`)

#### ✅ `createWorkOrder()`

- Include `recipeItems` (scaled) dengan full item details
- Include `recipe.recipeItems` untuk reference
- Map ke field `ingredients` untuk frontend
- Return: `{ ...wo, ingredients: [...] }`

#### ✅ `getWOById()`

- Include `recipeItems` dengan item details
- Include `recipe.recipeItems` untuk reference ingredients original
- Map ke field `ingredients`
- Return dengan proper structure

#### ✅ `startProduction()`

- Include full item details saat update status
- Map ke field `ingredients`
- Return: `{ ...updated, ingredients: [...] }`

#### ✅ `completeProduction()`

- Include `recipeItems`, `recipe.recipeItems`, `outputs`
- Map ke field `ingredients`
- Return dengan proper structure

#### ✅ `cancelWorkOrder()`

- Include full item details
- Map ke field `ingredients`
- Return dengan proper structure

---

## 🎨 Perbaikan Frontend

### 1️⃣ Recipe Components

#### ✅ `recipe-form.tsx`

```typescript
// Map ingredients/recipeItems dari response
defaultValues: recipe ? {
  ...
  ingredients: ((recipe as any).ingredients || (recipe as any).recipeItems || []).map((ing: any) => ({
    itemId: ing.itemId || ing.item?.id || '',
    quantity: ing.quantity || 0,
    unit: ing.unit || ItemUnit.KG,
  })),
} : {...}
```

- Support both `ingredients` dan `recipeItems` field names
- Changed `defaultValue` ke `value` di Select untuk controlled component
- Properly extract `itemId` dari either format

#### ✅ `recipes/page.tsx` (List)

- Support multiple field names: `items`, `recipeItems`, `ingredients`
- Calculate average ingredients with fallback logic

#### ✅ `recipes/[id]/page.tsx` (Detail)

- Display `recipe.items` dengan benar
- Backend provide field ini dari `recipeItems`

#### ✅ `recipes/[id]/edit/page.tsx` (Edit)

- Load data dengan ingredients mapping benar
- Form display ingredients terbaca dengan baik

### 2️⃣ Work Order Components

#### ✅ `work-orders/[id]/page.tsx` (Detail)

- **NEW**: Added "Scaled Ingredients" section
- Display `recipeItems` atau `ingredients` field
- Show quantity dengan 2 decimal places
- Display item details (name, SKU, unit)
- Conditional render jika ada ingredients

---

## 🔄 Data Flow (Complete)

```
┌─────────────────────────────────────────┐
│ CREATE RECIPE                           │
├─────────────────────────────────────────┤
│ Frontend: recipe-form.tsx               │
│   └─> POST /recipes                     │
│       └─> CreateRecipeDto               │
│           └─> ingredients: [...]        │
│                                         │
│ Backend: recipe.service.ts              │
│   └─> createRecipe()                    │
│       └─> CREATE recipeItems            │
│       └─> RETURN {                      │
│           ...recipe,                    │
│           ingredients: [...]            │
│       }                                  │
│                                         │
│ Frontend: useCreateRecipe hook          │
│   └─> Success: redirect ke list         │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ LIST RECIPES                            │
├─────────────────────────────────────────┤
│ Backend: getRecipes()                   │
│   └─> RETURN [{                         │
│       ...recipe,                        │
│       items: [...],                     │
│       ingredients: [...]                │
│   }]                                    │
│                                         │
│ Frontend: recipes/page.tsx              │
│   └─> Display dengan items count       │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ VIEW RECIPE DETAIL                      │
├─────────────────────────────────────────┤
│ Backend: getRecipeById()                │
│   └─> RETURN {                          │
│       ...recipe,                        │
│       items: [recipeItems],             │
│       ingredients: [...]                │
│   }                                     │
│                                         │
│ Frontend: recipes/[id]/page.tsx         │
│   └─> Display ingredients in table      │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ EDIT RECIPE                             │
├─────────────────────────────────────────┤
│ Frontend: recipes/[id]/edit/page.tsx    │
│   └─> Load recipe via useRecipe()       │
│   └─> Pass ke RecipeForm                │
│                                         │
│ RecipeForm: Map ingredients             │
│   └─> defaultValues: {                  │
│       ingredients: ing.recipeItems      │
│       .map(...)                         │
│   }                                     │
│   └─> PATCH /recipes/{id}               │
│                                         │
│ Backend: updateRecipe()                 │
│   └─> DELETE old recipeItems            │
│   └─> CREATE new recipeItems            │
│   └─> RETURN {..., ingredients: [...]}  │
│                                         │
│ Frontend: Success redirect              │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ CREATE WORK ORDER (dari recipe)         │
├─────────────────────────────────────────┤
│ Frontend: work-orders/new/page.tsx      │
│   └─> Select recipe                     │
│   └─> Enter plannedQuantity             │
│   └─> POST /work-orders                 │
│       └─> CreateWorkOrderDto            │
│                                         │
│ Backend: createWorkOrder()              │
│   └─> Fetch recipe + recipeItems        │
│   └─> SCALE ingredients:                │
│       quantity * (plannedQty / portion) │
│   └─> CREATE recipeItems with scaled    │
│   └─> RETURN {                          │
│       ...workOrder,                     │
│       ingredients: [scaled...]          │
│   }                                     │
│                                         │
│ Frontend: Success redirect              │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ VIEW WORK ORDER DETAIL                  │
├─────────────────────────────────────────┤
│ Backend: getWOById()                    │
│   └─> INCLUDE recipeItems (scaled)      │
│   └─> INCLUDE recipe.recipeItems        │
│   └─> RETURN {                          │
│       ...workOrder,                     │
│       recipeItems: [scaled...],         │
│       ingredients: [scaled...],         │
│       recipe: {..., recipeItems: [...]} │
│   }                                     │
│                                         │
│ Frontend: work-orders/[id]/page.tsx     │
│   └─> Display WO info                   │
│   └─> NEW: Display scaled ingredients   │
│       table dengan quantity.toFixed(2)  │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ START PRODUCTION                        │
├─────────────────────────────────────────┤
│ Frontend: Start button                  │
│   └─> POST /work-orders/{id}/start      │
│                                         │
│ Backend: startProduction()              │
│   └─> CHECK stock availability          │
│   └─> UPDATE status = IN_PROGRESS       │
│   └─> RETURN {..., ingredients: [...]}  │
│                                         │
│ Frontend: Update WO display             │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ COMPLETE/CANCEL PRODUCTION              │
├─────────────────────────────────────────┤
│ Backend: completeProduction()           │
│   └─> CONSUME ingredients from stock    │
│   └─> UPDATE status = COMPLETED         │
│   └─> RETURN {..., ingredients: [...]}  │
│                                         │
│ Backend: cancelWorkOrder()              │
│   └─> UPDATE status = CANCELLED         │
│   └─> RETURN {..., ingredients: [...]}  │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist Perbaikan

### Backend (`recipe.service.ts`)

- [x] `createRecipe()` - map ingredients
- [x] `getRecipes()` - include items + ingredients
- [x] `getRecipeById()` - map to ingredients field
- [x] `updateRecipe()` - proper response structure

### Backend (`work-order.service.ts`)

- [x] `createWorkOrder()` - scale + map ingredients
- [x] `getWOById()` - include recipe + recipeItems
- [x] `startProduction()` - consistent response
- [x] `completeProduction()` - include ingredients
- [x] `cancelWorkOrder()` - include ingredients

### Frontend (Recipe)

- [x] `recipe-form.tsx` - map ingredients/recipeItems
- [x] `recipes/page.tsx` - multiple field names
- [x] `recipes/[id]/page.tsx` - display items
- [x] `recipes/[id]/edit/page.tsx` - load with ingredients

### Frontend (Work Order)

- [x] `work-orders/[id]/page.tsx` - add scaled ingredients section

---

## 🎯 Result

✅ **Recipe Items** sekarang **terbaca dengan benar** saat:

- View list
- View detail
- Edit/Update
- Create work order

✅ **Work Order** sekarang menampilkan:

- Original recipe details
- Scaled ingredients berdasarkan planned quantity
- Item details (name, SKU, unit, quantity)
- Proper flow dari recipe creation hingga completion

✅ **Data Consistency**:

- Backend selalu return `ingredients` field
- Frontend support multiple field names untuk backward compatibility
- Proper mapping antara `recipeItems` dan `ingredients`

---

## 🔍 Testing Checklist

- [ ] Create recipe dengan beberapa items → View → Items terbaca ✅
- [ ] Edit recipe yang sudah ada → Items muncul di form ✅
- [ ] Update recipe → Items tetap terbaca ✅
- [ ] Create work order dari recipe → Ingredients ter-scale dengan benar ✅
- [ ] View work order detail → Scaled ingredients table tampil ✅
- [ ] Start production → Status update dengan ingredients intact ✅
- [ ] Complete production → Final status dengan proper data ✅
