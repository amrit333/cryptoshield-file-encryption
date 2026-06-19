import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Total Files Count
    const totalFiles = await prisma.file.count({
      where: { userId }
    });

    // 2. Encrypted Files Count
    const encryptedFiles = await prisma.file.count({
      where: { userId, status: "ENCRYPTED" }
    });

    // 3. Decrypted Actions Count
    const decryptedCount = await prisma.activityLog.count({
      where: { userId, action: "DOWNLOAD_DECRYPT" }
    });

    // 4. Storage Used Sum
    const storageAggregate = await prisma.file.aggregate({
      where: { userId },
      _sum: { size: true }
    });
    const totalSizeBytes = storageAggregate._sum.size || 0;
    
    // Format storage size
    let storageFormatted = "0 Bytes";
    if (totalSizeBytes > 0) {
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(totalSizeBytes) / Math.log(k));
      storageFormatted = parseFloat((totalSizeBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    // 5. Security Posture Score
    // Base is 85, if files > 0 + 5, if activity > 0 + 5, if 2FA (we can mock this or check if they have keys) + 5
    let securityScore = 85;
    if (totalFiles > 0) securityScore += 5;
    if (decryptedCount > 0) securityScore += 5;
    if (securityScore > 100) securityScore = 100;

    // 6. Chart data: Activity over the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    const logs = await prisma.activityLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityData = last7Days.map(date => {
      const dayName = days[date.getDay()];
      const dayLogs = logs.filter(log => new Date(log.createdAt).toDateString() === date.toDateString());
      const encrypts = dayLogs.filter(l => l.action === "UPLOAD_ENCRYPT").length;
      const decrypts = dayLogs.filter(l => l.action === "DOWNLOAD_DECRYPT").length;
      return { name: dayName, encrypts, decrypts };
    });

    // 7. File type breakdown
    const files = await prisma.file.findMany({
      where: { userId },
      select: { mimeType: true }
    });

    const categories = {
      PDF: 0,
      DOCX: 0,
      Images: 0,
      Archives: 0,
      Others: 0
    };

    files.forEach(file => {
      const mime = file.mimeType.toLowerCase();
      if (mime.includes("pdf")) {
        categories.PDF++;
      } else if (mime.includes("word") || mime.includes("document") || mime.includes("docx") || mime.includes("msword")) {
        categories.DOCX++;
      } else if (mime.includes("image")) {
        categories.Images++;
      } else if (mime.includes("zip") || mime.includes("tar") || mime.includes("rar") || mime.includes("7z") || mime.includes("compressed")) {
        categories.Archives++;
      } else {
        categories.Others++;
      }
    });

    const fileTypeData = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    // Fallback if empty
    if (fileTypeData.length === 0) {
      fileTypeData.push({ name: "None", value: 1 });
    }

    return NextResponse.json({
      stats: {
        totalFiles,
        encryptedFiles,
        decryptedCount,
        storageFormatted,
        securityScore
      },
      activityData,
      fileTypeData
    });

  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to load dashboard statistics" }, { status: 500 });
  }
}
