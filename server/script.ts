import { prisma } from "./lib/prisma";

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Mayank",
      email: "mayank@gmail.com",
      provider: "manual",
    },
  });

  console.log("Created user:", user);

  const users = await prisma.user.findMany();

  console.log("All users:", users);
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