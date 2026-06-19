import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await req.json();
    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Allow owner or admin to delete
    if (fileRecord.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete from filesystem
    if (fs.existsSync(fileRecord.storagePath)) {
      try {
        fs.unlinkSync(fileRecord.storagePath);
      } catch (fsErr) {
        console.error("Failed to delete physical file:", fsErr);
        // Continue to delete from DB anyway so DB is clean
      }
    }

    // Delete from DB (cascades to encryptionRecord and shareLinks)
    await prisma.file.delete({
      where: { id: fileId }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_FILE",
        description: `Deleted file: ${fileRecord.originalName}`,
      }
    });

    return NextResponse.json({ success: true, message: "File deleted successfully" });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
