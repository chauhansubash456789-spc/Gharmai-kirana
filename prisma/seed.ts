import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/session";
import { slugify } from "../src/lib/format";

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPhone = process.env.ADMIN_PHONE || "9800000000";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const existingAdmin = await prisma.user.findUnique({ where: { phone: adminPhone } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Store Admin",
        phone: adminPhone,
        email: "admin@gharmaikirana.np",
        passwordHash: await hashPassword(adminPassword),
        role: "admin",
      },
    });
    console.log(`Admin created: phone ${adminPhone}, password ${adminPassword}`);
  }

  const driverPhone = "9811111111";
  const existingDriver = await prisma.user.findUnique({ where: { phone: driverPhone } });
  if (!existingDriver) {
    await prisma.user.create({
      data: {
        name: "Rider One",
        phone: driverPhone,
        email: "rider@gharmaikirana.np",
        passwordHash: await hashPassword("driver123"),
        role: "driver",
        isOnline: true,
        vehicleType: "Bike",
      },
    });
    console.log("Demo driver created: phone 9811111111, password driver123");
  }

  // Delivery zones
  const zones = [
    { name: "Central Birgunj", charge: 20, minOrderForFree: 5000, sortOrder: 1 },
    { name: "Nearby Areas", charge: 40, minOrderForFree: 5000, sortOrder: 2 },
    { name: "Outer Areas", charge: 70, minOrderForFree: 5000, sortOrder: 3 },
  ];
  for (const z of zones) {
    const exists = await prisma.deliveryZone.findFirst({ where: { name: z.name } });
    if (!exists) await prisma.deliveryZone.create({ data: z });
  }

  // Coupons
  const coupons = [
    { code: "WELCOME100", type: "flat", value: 100, minOrder: 999 },
    { code: "SAVE10", type: "percent", value: 10, minOrder: 1500, maxDiscount: 200 },
    { code: "FREE50", type: "flat", value: 50, minOrder: 999 },
  ];
  for (const c of coupons) {
    const exists = await prisma.coupon.findUnique({ where: { code: c.code } });
    if (!exists) await prisma.coupon.create({ data: c as never });
  }

  // Categories
  const categories = [
    "Rice & Grains",
    "Dal & Pulses",
    "Oil & Ghee",
    "Sugar, Salt & Atta",
    "Spices & Masala",
    "Snacks & Biscuits",
    "Noodles & Pasta",
    "Tea & Coffee",
    "Beverages",
    "Dairy & Eggs",
    "Cleaning Products",
    "Personal Care",
    "Baby Products",
    "Household",
  ];
  const catIds: Record<string, number> = {};
  for (const name of categories) {
    const slug = slugify(name);
    let cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) cat = await prisma.category.create({ data: { name, slug } });
    catIds[name] = cat.id;
  }

  // Products: [name, category, brand, unit, mrp, price, purchasePrice, stock, expiryInDays?, bestSeller?, description]
  type ProductRow = [string, string, string, string, number, number, number, number, number | null, ...unknown[]];
const products: ProductRow[] = [
    ["Bajra Super Basmati Rice - 1 KG Pack", "Rice & Grains", "Bajra", "1 kg", 218, 195, 180, 120, null, true, "Fine long-grain rice, ideal for daily cooking."],
    ["Annapurna Gold Rice - 5 KG", "Rice & Grains", "Annapurna", "5 kg", 1000, 920, 870, 60, null, true],
    ["Oryza Sona Mansuli Rice - 1 KG", "Rice & Grains", "Oryza", "1 kg", 145, 130, 120, 90, null],
    ["Rani Mung Dal (Split Yellow) - 1 KG", "Dal & Pulses", "Rani", "1 kg", 265, 238, 220, 80, null, true],
    ["Annapurna Masoor Dal - 1 KG", "Dal & Pulses", "Annapurna", "1 kg", 175, 158, 145, 85, null],
    ["Rani Chana Dal - 1 KG", "Dal & Pulses", "Rani", "1 kg", 185, 168, 152, 70, null],
    ["Rani Horse Gram (Ghore Mas) - 1 KG", "Dal & Pulses", "Rani", "1 kg", 195, 178, 165, 50, null],
    ["Annapurna Sugar 5KG Bag", "Sugar, Salt & Atta", "Annapurna", "5 kg", 350, 330, 305, 100, null, true],
    ["Annapurna Table Salt - 1 KG", "Sugar, Salt & Atta", "Annapurna", "1 kg", 38, 33, 28, 200, null, true],
    ["Mayur Lohpath Atta - 5 KG", "Sugar, Salt & Atta", "Mayur", "5 kg", 430, 395, 370, 55, null, true],
    ["Annapurna Arnish Taila 1L Sachet", "Oil & Ghee", "Annapurna", "1 L sachet", 400, 375, 350, 80, null, true],
    ["Annapurna BRB Vegetable Oil - 1 L", "Oil & Ghee", "Annapurna", "1 L", 218, 198, 185, 90, null],
    ["Annapurna Sunflower Oil - 1 L", "Oil & Ghee", "Annapurna", "1 L", 285, 265, 248, 60, null],
    ["Annapurna Soyabeen Oil - 5 L", "Oil & Ghee", "Annapurna", "5 L", 975, 920, 865, 35, null],
    ["Purani Dali Mustard Oil - 1 L", "Oil & Ghee", "Purani Dali", "1 L", 420, 395, 372, 40, null],
    ["Annapurna Ghee 500g", "Oil & Ghee", "Annapurna", "500 g", 485, 455, 430, 30, null],
    ["Jivan Lal Mirch Powder - 100g", "Spices & Masala", "Jivan", "100 g", 118, 105, 95, 130, null, true],
    ["Jivan Dhaniya Powder - 100g", "Spices & Masala", "Jivan", "100 g", 122, 108, 98, 120, null],
    ["Jivan Turmeric Powder - 100g", "Spices & Masala", "Jivan", "100 g", 118, 105, 95, 120, null],
    ["Jivan Jeera - 100g", "Spices & Masala", "Jivan", "100 g", 135, 120, 110, 110, null],
    ["Jivan Garam Masala - 100g", "Spices & Masala", "Jivan", "100 g", 145, 128, 118, 90, null],
    ["Wai Wai Instant Noodles (Veg) - Pack", "Noodles & Pasta", "CG Wai Wai", "75 g", 22, 18, 16, 250, null, true],
    ["Wai Wai Instant Noodles (Chicken) Pack", "Noodles & Pasta", "CG Wai Wai", "75 g", 22, 18, 16, 250, null],
    ["CG Wai Wai Burger - Pack", "Noodles & Pasta", "CG Wai Wai", "150 g", 35, 30, 26, 200, null],
    ["Rara Instant Noodles - Pack", "Noodles & Pasta", "Chaudhary", "75 g", 22, 18, 16, 240, null],
    ["CG Maggi Noodles 2-Minute - Pack", "Noodles & Pasta", "Nestle", "70 g", 22, 19, 17, 180, null],
    ["Parle-G Biscuits - Pack", "Snacks & Biscuits", "Parle", "200 g", 45, 38, 34, 300, null, true],
    ["Parle-G Biscuits Jumbo - Pack", "Snacks & Biscuits", "Parle", "500 g", 120, 105, 95, 150, null],
    ["Nabisco Ritz Crackers - Pack", "Snacks & Biscuits", "Nabisco", "175 g", 135, 118, 108, 100, null],
    ["Himal Salt Biscuit - 150g", "Snacks & Biscuits", "Himal", "150 g", 38, 32, 29, 180, null],
    ["Kurkure Namkeen Masala Munch - Pack", "Snacks & Biscuits", "PepsiCo", "54 g", 20, 17, 15, 260, null],
    ["Lays Classic Salted - Pack", "Snacks & Biscuits", "PepsiCo", "48 g", 30, 26, 23, 220, null],
    ["Nescafe Classic Coffee - Jar", "Tea & Coffee", "Nestle", "100 g", 1080, 990, 900, 25, null, true],
    ["Nepal Tea Producers CTC Dust - Pack", "Tea & Coffee", "NTP", "250 g", 220, 198, 182, 45, null, true],
    ["Nepal Tea Producers Orthodox Leaf - 250g", "Tea & Coffee", "NTP", "250 g", 260, 235, 218, 40, null],
    ["Coca Cola PET - 1L", "Beverages", "Coca-Cola", "1 L", 110, 95, 85, 90, null],
    ["Mohito Orange Drink - 500ml", "Beverages", "Mohito", "500 ml", 35, 30, 27, 200, null],
    ["Chaudhary Glacier Water - 1L", "Beverages", "Chaudhary", "1 L", 30, 25, 22, 220, null],
    ["Nimbu Pani Ready Mix - 500ml", "Beverages", "Chaudhary", "500 ml", 40, 34, 30, 150, null],
    ["Nimbus Dahi (Curd) - 500g", "Dairy & Eggs", "Nimbus", "500 g", 85, 78, 70, 30, 4, null, "Fresh curd, stored chilled."],
    ["Suyog Paneer - 200g", "Dairy & Eggs", "Suyog", "200 g", 90, 82, 74, 25, 6, null],
    ["Nimbus Fresh Milk - 1L", "Dairy & Eggs", "Nimbus", "1 L", 100, 92, 84, 40, 2, null, "Pasteurized fresh milk."],
    ["Local Brown Eggs - Half Dozen", "Dairy & Eggs", "Local", "6 pcs", 150, 138, 125, 60, 14, true],
    ["Indian Lays/Cornetto Combo Offer", "Beverages", "", "Combo", 450, 399, 340, 20, null, null, "Combo pack — buy more, save more. Monthly grocery bundles coming soon."],
    ["Clean Net Dishwashing Gel - 500ml", "Cleaning Products", "Clean", "500 ml", 165, 148, 135, 80, null],
    ["Vim Dishwash Bar - 200g", "Cleaning Products", "HUL", "200 g", 35, 30, 26, 180, null],
    ["Rin Detergent Powder - 1kg", "Cleaning Products", "HUL", "1 kg", 210, 190, 175, 90, null, true],
    ["Surf Excel Detergent Powder - 1kg", "Cleaning Products", "HUL", "1 kg", 240, 215, 200, 75, null],
    ["Wheel Detergent Bar - 150g", "Cleaning Products", "HUL", "150 g", 25, 21, 18, 250, null],
    ["Lux Soap - 100g", "Personal Care", "HUL", "100 g", 75, 65, 58, 200, null],
    ["Lifebuoy Soap - 100g", "Personal Care", "HUL", "100 g", 70, 60, 54, 200, null, true],
    ["Close-up Toothpaste - 120g", "Personal Care", "HUL", "120 g", 190, 170, 155, 80, null],
    ["Dabur Babool Toothpaste - 150g", "Personal Care", "Dabur", "150 g", 120, 105, 95, 100, null],
    ["Sunlight Shampoo Sachet - Pack", "Personal Care", "HUL", "10 pcs", 120, 105, 95, 140, null],
    ["Pampers Baby Diapers M - 10s", "Baby Products", "P&G", "10 pcs", 690, 625, 570, 25, null, null, "Gentle protection for baby."],
    ["Cetaphil Baby Lotion - 100ml", "Baby Products", "Spectra", "100 ml", 395, 360, 330, 20, null],
    ["Himalaya Baby Powder - 100g", "Baby Products", "Himalaya", "100 g", 145, 128, 118, 40, null],
    ["HRN Mosquito Coil - 10 Pcs", "Household", "HRN", "10 pcs", 70, 60, 54, 120, null],
    ["Maruti Matches (Picnic) - Box", "Household", "Maruti", "1 box", 10, 8, 7, 400, null],
    ["LPG Chunni Napkin - Pack", "Household", "Chunni", "1 pkt", 45, 39, 35, 200, null],
  ];

  for (const p of products) {
    const [name, category, brand, unit, mrp, price, purchasePrice, stock, expiryDays, bestSeller, description] = p;
    const sku = `SKU-${slugify(name).slice(0, 24).toUpperCase()}-${catIds[category]}`;
    const exists = await prisma.product.findUnique({ where: { sku } });
    if (exists) continue;
    await prisma.product.create({
      data: {
        sku,
        name,
        slug: slugify(name),
        categoryId: catIds[category],
        brand: brand || null,
        unit,
        mrp,
        price,
        purchasePrice,
        stock,
        description: typeof description === "string" ? description : null,
        bestSeller: bestSeller === true,
        featured: false,
        expiryDate: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null,
      },
    });
  }

  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    coupons: await prisma.coupon.count(),
    zones: await prisma.deliveryZone.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });