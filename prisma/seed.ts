import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create an Admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cryptoshield.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@cryptoshield.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create a standard user
  const userPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@cryptoshield.com" },
    update: {},
    create: {
      name: "Test User",
      email: "user@cryptoshield.com",
      password: userPassword,
      role: "USER",
    },
  });
  console.log(`Created standard user: ${user.email}`);

  // Generate some dummy files and encryption records for the standard user
  for (let i = 1; i <= 5; i++) {
    const file = await prisma.file.create({
      data: {
        userId: user.id,
        originalName: `Financial_Report_Q${i}_2025.pdf`,
        encryptedName: `enc_1234567890_Q${i}.enc`,
        size: Math.floor(Math.random() * 5000000) + 1000000, // 1MB to 6MB
        mimeType: "application/pdf",
        storagePath: `/uploads/enc_1234567890_Q${i}.enc`,
        status: "ENCRYPTED",
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
        encryptionRecord: {
          create: {
            userId: user.id,
            salt: "dummy_salt_hex",
            iv: "dummy_iv_hex",
          }
        }
      }
    });

    // Add activity log for upload
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "UPLOAD_ENCRYPT",
        description: `Uploaded and encrypted file: ${file.originalName}`,
        createdAt: file.createdAt
      }
    });
    
    // Sometimes add a decryption activity
    if (i % 2 === 0) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "DOWNLOAD_DECRYPT",
          description: `Decrypted and downloaded file: ${file.originalName}`,
          createdAt: new Date(file.createdAt.getTime() + 86400000) // 1 day later
        }
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
