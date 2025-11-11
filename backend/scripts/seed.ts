import { PrismaClient, UserRole, ItemType, ItemUnit, LocationType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mbg.org' },
    update: {},
    create: {
      email: 'admin@mbg.org',
      password: hashedPassword,
      fullName: 'Admin MBG',
      role: UserRole.ADMIN,
      isApproved: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const bahanPokok = await prisma.category.upsert({
    where: { code: 'BP' },
    update: {},
    create: {
      code: 'BP',
      name: 'Bahan Pokok',
      description: 'Bahan makanan pokok seperti beras, gula, minyak',
    },
  });

  const bumbu = await prisma.category.upsert({
    where: { code: 'BD' },
    update: {},
    create: {
      code: 'BD',
      name: 'Bumbu Dapur',
      description: 'Bumbu dan rempah-rempah',
    },
  });

  const protein = await prisma.category.upsert({
    where: { code: 'PROT' },
    update: {},
    create: {
      code: 'PROT',
      name: 'Protein',
      description: 'Ayam, daging, ikan, telur',
    },
  });

  const finishedGoods = await prisma.category.upsert({
    where: { code: 'FG' },
    update: {},
    create: {
      code: 'FG',
      name: 'Finished Goods',
      description: 'Produk jadi siap distribusi',
    },
  });

  console.log('✅ Categories created');

  // Create locations
  const gudangUtama = await prisma.location.upsert({
    where: { code: 'GU01' },
    update: {},
    create: {
      code: 'GU01',
      name: 'Gudang Utama',
      type: LocationType.CENTRAL_WAREHOUSE,
      address: 'Jl. Masjid No. 1, Baitul Ghafur',
      capacityKg: 1000,
    },
  });

  const dapur = await prisma.location.upsert({
    where: { code: 'DP01' },
    update: {},
    create: {
      code: 'DP01',
      name: 'Dapur Produksi',
      type: LocationType.KITCHEN,
      address: 'Jl. Masjid No. 2, Baitul Ghafur',
      capacityKg: 500,
    },
  });

  const distributionCenter = await prisma.location.upsert({
    where: { code: 'DC01' },
    update: {},
    create: {
      code: 'DC01',
      name: 'Pusat Distribusi',
      type: LocationType.DISTRIBUTION_POINT,
      address: 'Jl. Masjid No. 3, Baitul Ghafur',
      capacityKg: 300,
    },
  });

  console.log('✅ Locations created');

  // Create items
  const beras = await prisma.item.upsert({
    where: { sku: 'BRS001' },
    update: {},
    create: {
      sku: 'BRS001',
      code: 'BRS001',
      name: 'Beras Premium',
      itemType: ItemType.RAW_MATERIAL,
      unit: ItemUnit.KG,
      categoryId: bahanPokok.id,
      reorderPoint: 100,
      price: 15000,
      description: 'Beras premium kualitas terbaik',
    },
  });

  const ayam = await prisma.item.upsert({
    where: { sku: 'AYM001' },
    update: {},
    create: {
      sku: 'AYM001',
      code: 'AYM001',
      name: 'Ayam Broiler',
      itemType: ItemType.RAW_MATERIAL,
      unit: ItemUnit.KG,
      categoryId: protein.id,
      reorderPoint: 50,
      price: 35000,
      description: 'Ayam broiler segar',
    },
  });

  const minyak = await prisma.item.upsert({
    where: { sku: 'MYK001' },
    update: {},
    create: {
      sku: 'MYK001',
      code: 'MYK001',
      name: 'Minyak Goreng',
      itemType: ItemType.RAW_MATERIAL,
      unit: ItemUnit.LITER,
      categoryId: bahanPokok.id,
      reorderPoint: 30,
      price: 18000,
      description: 'Minyak goreng kemasan',
    },
  });

  const nasiBox = await prisma.item.upsert({
    where: { sku: 'NBA001' },
    update: {},
    create: {
      sku: 'NBA001',
      code: 'NBA001',
      name: 'Nasi Box Ayam',
      itemType: ItemType.FINISHED_GOOD,
      unit: ItemUnit.PCS,
      categoryId: finishedGoods.id,
      reorderPoint: 0,
      price: 25000,
      description: 'Nasi box dengan ayam rendang',
    },
  });

  console.log('✅ Items created');

  // Create supplier
  const supplier = await prisma.supplier.upsert({
    where: { code: 'SPN001' },
    update: {},
    create: {
      code: 'SPN001',
      name: 'PT Sumber Pangan Nusantara',
      email: 'contact@spn.com',
      phone: '021-12345678',
      address: 'Jakarta Pusat',
      verified: true,
      rating: 4.5,
    },
  });

  console.log('✅ Supplier created');

  // Create recipe
  const recipe = await prisma.recipe.upsert({
    where: { name: 'Nasi Box Ayam Rendang' },
    update: {},
    create: {
      code: 'NBA001',
      name: 'Nasi Box Ayam Rendang',
      description: 'Nasi box dengan ayam bumbu rendang',
      portionSize: 1,
      recipeItems: {
        create: [
          {
            itemId: beras.id,
            quantity: 0.15, // 150g per portion
            unit: ItemUnit.KG,
          },
          {
            itemId: ayam.id,
            quantity: 0.1, // 100g per portion
            unit: ItemUnit.KG,
          },
          {
            itemId: minyak.id,
            quantity: 0.02, // 20ml per portion
            unit: ItemUnit.LITER,
          },
        ],
      },
    },
  });

  console.log('✅ Recipe created');

  // Create beneficiary
  const beneficiary = await prisma.beneficiary.upsert({
    where: { code: 'YPD-JKT-001' },
    update: {},
    create: {
      code: 'YPD-JKT-001',
      name: 'Yayasan Peduli Dhuafa Jakarta',
      type: 'Charity Organization',
      contactPerson: 'Budi Santoso',
      phone: '08123456789',
      address: 'Jl. Kebajikan No. 123, Jakarta Timur',
      targetQuota: 100,
    },
  });

  // Link beneficiary to distribution center
  await prisma.locationBeneficiary.upsert({
    where: {
      locationId_beneficiaryId: {
        locationId: distributionCenter.id,
        beneficiaryId: beneficiary.id,
      },
    },
    update: {},
    create: {
      locationId: distributionCenter.id,
      beneficiaryId: beneficiary.id,
    },
  });

  console.log('✅ Beneficiary created');

  // Create some initial stock
  await prisma.stock.upsert({
    where: {
      itemId_locationId_batchNumber: {
        itemId: beras.id,
        locationId: gudangUtama.id,
        batchNumber: '',
      },
    },
    update: {},
    create: {
      itemId: beras.id,
      locationId: gudangUtama.id,
      quantity: 200,
      expiryDate: new Date('2026-11-10'),
    },
  });

  await prisma.stock.upsert({
    where: {
      itemId_locationId_batchNumber: {
        itemId: ayam.id,
        locationId: gudangUtama.id,
        batchNumber: '',
      },
    },
    update: {},
    create: {
      itemId: ayam.id,
      locationId: gudangUtama.id,
      quantity: 100,
      expiryDate: new Date('2025-11-15'),
    },
  });

  console.log('✅ Initial stock created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });