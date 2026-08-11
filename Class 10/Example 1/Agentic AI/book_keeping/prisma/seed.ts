import { PrismaClient } from "../app/lib/generated";

const prisma = new PrismaClient();

const categories = [
  { name: "Housing", color: "#2563eb", icon: "home" },
  { name: "Food & Dining", color: "#16a34a", icon: "utensils" },
  { name: "Transportation", color: "#d97706", icon: "car" },
  { name: "Utilities", color: "#7c3aed", icon: "bolt" },
  { name: "Office Supplies", color: "#0891b2", icon: "briefcase" },
  { name: "Travel", color: "#db2777", icon: "plane" },
  { name: "Entertainment", color: "#e11d48", icon: "film" },
  { name: "Healthcare", color: "#059669", icon: "heart-pulse" },
  { name: "Shopping", color: "#ca8a04", icon: "shopping-bag" },
  { name: "Other", color: "#6b7280", icon: "ellipsis" },
];

async function main() {
  console.log("Seeding categories...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
