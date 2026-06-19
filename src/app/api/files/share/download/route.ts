import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptBuffer, deriveKey } from "@/lib/encryption";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    // Find share link and associated file/encryption details
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: { 
        file: { 
          include: { 
            encryptionRecord: true 
          } 
        } 
      }
    });

    if (!shareLink) {
      return NextResponse.json({ error: "Invalid or expired share link" }, { status: 404 });
    }

    // Check expiration
    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Share link has expired" }, { status: 410 });
    }

    // Check download limit
    if (shareLink.downloadLimit !== null && shareLink.downloadLimit <= 0) {
      return NextResponse.json({ error: "Share link download limit reached" }, { status: 410 });
    }

    const fileRecord = shareLink.file;
    if (!fileRecord || !fileRecord.encryptionRecord) {
      return NextResponse.json({ error: "File record configuration error" }, { status: 404 });
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

    // Decryption process
    let decryptedBuffer: Buffer;
    try {
      const { salt, iv } = fileRecord.encryptionRecord;
      const key = deriveKey(password, salt);
      decryptedBuffer = decryptBuffer(encryptedBuffer, key, iv);
    } catch (err) {
      return NextResponse.json({ error: "Invalid password. Decryption failed." }, { status: 401 });
    }

    // Update download limit (decrement or delete if last use)
    if (shareLink.downloadLimit !== null) {
      if (shareLink.downloadLimit <= 1) {
        await prisma.shareLink.delete({
          where: { id: shareLink.id }
        });
      } else {
        await prisma.shareLink.update({
          where: { id: shareLink.id },
          data: { downloadLimit: shareLink.downloadLimit - 1 }
        });
      }
    }

    // Log public download activity for the file owner
    await prisma.activityLog.create({
      data: {
        userId: fileRecord.userId,
        action: "SHARE_DOWNLOAD",
        description: `Public user downloaded shared file: ${fileRecord.originalName}`,
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
    console.error("Public share download error:", error);
    return NextResponse.json({ error: "Failed to download and decrypt shared file" }, { status: 500 });
  }
}
