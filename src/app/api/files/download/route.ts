import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptBuffer, deriveKey } from "@/lib/encryption";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId, password, raw } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    if (!raw && !password) {
      return NextResponse.json({ error: "Password is required for decryption" }, { status: 400 });
    }

    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId },
      include: { encryptionRecord: true }
    });

    if (!fileRecord || (fileRecord.userId !== session.user.id && session.user.role !== "ADMIN") || !fileRecord.encryptionRecord) {
      return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
    }

    // Read encrypted file from disk
    let filePath = fileRecord.storagePath;
    if (!fs.existsSync(filePath)) {
      const fallbackPath = path.join(process.cwd(), "uploads", fileRecord.encryptedName);
      if (fs.existsSync(fallbackPath)) {
        filePath = fallbackPath;
      } else {
        return NextResponse.json({ error: "Encrypted file not found on disk" }, { status: 404 });
      }
    }
    
    const encryptedBuffer = fs.readFileSync(filePath);

    if (raw) {
      // Log raw download activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "DOWNLOAD_ENCRYPTED",
          description: `Downloaded raw encrypted file: ${fileRecord.originalName}.enc`,
        }
      });

      return new NextResponse(encryptedBuffer, {
        headers: {
          "Content-Disposition": `attachment; filename="${fileRecord.originalName}.enc"`,
          "Content-Type": "application/octet-stream",
          "Content-Length": encryptedBuffer.length.toString(),
        }
      });
    }

    const { salt, iv } = fileRecord.encryptionRecord;

    // Decryption process
    let decryptedBuffer: Buffer;
    try {
      const key = deriveKey(password, salt);
      decryptedBuffer = decryptBuffer(encryptedBuffer, key, iv);
    } catch (err) {
      return NextResponse.json({ error: "Invalid password or corrupted file" }, { status: 401 });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "DOWNLOAD_DECRYPT",
        description: `Decrypted and downloaded file: ${fileRecord.originalName}`,
      }
    });

    // Return the decrypted file as a downloadable response
    return new NextResponse(decryptedBuffer as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileRecord.originalName}"`,
        "Content-Type": fileRecord.mimeType || "application/octet-stream",
        "Content-Length": decryptedBuffer.length.toString(),
      }
    });

  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Failed to decrypt and download file" }, { status: 500 });
  }
}
