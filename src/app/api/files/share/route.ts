import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId, expiresInHours, downloadLimit } = await req.json();
    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Only owner can share files
    if (fileRecord.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Generate unique token
    const token = crypto.randomBytes(24).toString("hex");

    // Calculate expiry date
    let expiresAt: Date | null = null;
    if (expiresInHours && typeof expiresInHours === "number" && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    }

    // Limit parses
    const limit = downloadLimit && typeof downloadLimit === "number" && downloadLimit > 0 ? downloadLimit : null;

    // Create ShareLink
    const shareLink = await prisma.shareLink.create({
      data: {
        fileId,
        token,
        expiresAt,
        downloadLimit: limit
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "SHARE_FILE",
        description: `Generated secure share link for file: ${fileRecord.originalName}`,
      }
    });

    // Dynamic sharing URL construction using origin
    const origin = req.nextUrl.origin;
    const shareUrl = `${origin}/share/${token}`;

    return NextResponse.json({ 
      success: true, 
      shareUrl, 
      token, 
      expiresAt: shareLink.expiresAt,
      downloadLimit: shareLink.downloadLimit
    });

  } catch (error: any) {
    console.error("Share error:", error);
    return NextResponse.json({ error: "Failed to generate share link" }, { status: 500 });
  }
}
