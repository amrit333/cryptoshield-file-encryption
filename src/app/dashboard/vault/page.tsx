import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EncryptModal } from "@/components/encrypt-modal";
import { VaultTable } from "@/components/vault-table";

export default async function VaultPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const files = await prisma.file.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">File Vault</h2>
          <p className="text-muted-foreground">Manage your encrypted files securely.</p>
        </div>
        <EncryptModal />
      </div>

      <VaultTable files={files as any} />
    </div>
  );
}
