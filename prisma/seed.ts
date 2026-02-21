import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Stardream Logo Mug",
    slug: "stardream-logo-mug",
    description: "Signature daily mug for Stardream fans.",
    price: 12900,
    images: ["/placeholder/mug-1.png"],
    category: "living",
    options: { color: ["white", "navy"] },
    stock: 24,
  },
  {
    name: "Moon Cat Keyring",
    slug: "moon-cat-keyring",
    description: "Compact acrylic keyring for bags and pouches.",
    price: 7900,
    images: ["/placeholder/keyring-1.png"],
    category: "accessory",
    options: { type: ["silver", "gold"] },
    stock: 50,
  },
  {
    name: "Constellation Sticker Pack",
    slug: "constellation-sticker-pack",
    description: "Water-resistant decorative sticker set.",
    price: 5900,
    images: ["/placeholder/sticker-1.png"],
    category: "stationery",
    options: { sheets: 3 },
    stock: 100,
  },
  {
    name: "Dream Poster A2",
    slug: "dream-poster-a2",
    description: "Large illustration poster for your room.",
    price: 15900,
    images: ["/placeholder/poster-1.png"],
    category: "living",
    options: { size: "A2" },
    stock: 18,
  },
  {
    name: "Starnight Pouch",
    slug: "starnight-pouch",
    description: "Daily carry mini pouch with zipper.",
    price: 10900,
    images: ["/placeholder/pouch-1.png"],
    category: "accessory",
    options: { color: ["cream", "black"] },
    stock: 30,
  },
  {
    name: "Wish Note Set",
    slug: "wish-note-set",
    description: "Three-style notebook bundle.",
    price: 9900,
    images: ["/placeholder/note-1.png"],
    category: "stationery",
    options: { pages: 64 },
    stock: 42,
  },
  {
    name: "Starlight Phone Case",
    slug: "starlight-phone-case",
    description: "Slim transparent hard phone case.",
    price: 14900,
    images: ["/placeholder/case-1.png"],
    category: "accessory",
    options: { model: ["iPhone", "Galaxy"] },
    stock: 36,
  },
  {
    name: "Night Sky Postcard Set",
    slug: "night-sky-postcard-set",
    description: "Eight postcard illustrations for collection.",
    price: 6900,
    images: ["/placeholder/postcard-1.png"],
    category: "stationery",
    options: { quantity: 8 },
    stock: 80,
  },
];

async function main() {
  await prisma.product.deleteMany();
  await prisma.order.deleteMany();

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
