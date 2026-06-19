import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptBuffer, generateSalt, generateIV, deriveKey } from "@/lib/encryption";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const password = formData.get("password") as string | null;

    if (!file || !password) {
      return NextResponse.json({ error: "File and password are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Encryption process
    const salt = generateSalt();
    const iv = generateIV();
    const key = deriveKey(password, salt);
    
    const encryptedBuffer = encryptBuffer(buffer, key, iv);
    
    // Save to disk
    const encryptedName = `${Date.now()}-${file.name}.enc`;
    const storagePath = path.join(UPLOADS_DIR, encryptedName);
    fs.writeFileSync(storagePath, encryptedBuffer);

    // Save to DB
    const newFile = await prisma.file.create({
      data: {
        userId: session.user.id,
        originalName: file.name,
        encryptedName,
        size: encryptedBuffer.length,
        mimeType: file.type,
        storagePath,
        status: "ENCRYPTED",
        encryptionRecord: {
          create: {
            userId: session.user.id,
            salt,
            iv,
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPLOAD_ENCRYPT",
        description: `Uploaded and encrypted file: ${file.name}`,
      }
    });

    return NextResponse.json({ success: true, file: newFile });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload and encrypt file" }, { status: 500 });
  }
}
