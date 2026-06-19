import { prisma } from "@/lib/prisma";
import { ShareDownloadForm } from "@/components/share-download-form";
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  // Find the share link details
  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: { file: true }
  });

  const getValidationError = () => {
    if (!shareLink) {
      return "This share link is invalid or has expired.";
    }

    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return "This secure sharing link has expired.";
    }

    if (shareLink.downloadLimit !== null && shareLink.downloadLimit <= 0) {
      return "The maximum download limit for this link has been reached.";
    }

    return null;
  };

  const validationError = getValidationError();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative p-4 selection:bg-cyan-500/30">
      {/* Background grids */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-10 bg-cyan-500 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      {/* Top Navbar */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Brand logo header */}
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-6 h-6 text-cyan-400" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            CryptoShield
          </span>
        </div>

        {validationError || !shareLink ? (
          // Invalid or Expired UI State
          <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6 border border-yellow-500/20">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-sm mb-6">{validationError}</p>
            <Link 
              href="/" 
              className="px-6 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors text-sm border border-border"
            >
              Return to Landing
            </Link>
          </div>
        ) : (
          // Active & Valid Download Form
          <ShareDownloadForm 
            token={token}
            fileName={shareLink.file.originalName}
            fileSize={shareLink.file.size}
            mimeType={shareLink.file.mimeType}
          />
        )}
      </div>
    </div>
  );
}
