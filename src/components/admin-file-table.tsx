"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X, AlertTriangle, Loader2, User, Mail, FileIcon } from "lucide-react";

interface AdminFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: string;
  createdAt: Date | string;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface AdminFileTableProps {
  files: AdminFile[];
}

export function AdminFileTable({ files: initialFiles }: AdminFileTableProps) {
  const router = useRouter();
  const [files, setFiles] = useState<AdminFile[]>(initialFiles);
  const [activeFile, setActiveFile] = useState<AdminFile | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const openDeleteModal = (file: AdminFile) => {
    setActiveFile(file);
    setIsDeleteOpen(true);
    setActionError("");
  };

  const closeDeleteModal = () => {
    setActiveFile(null);
    setIsDeleteOpen(false);
    setActionError("");
  };

  const handleDeleteFile = async () => {
    if (!activeFile) return;

    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch("/api/files/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: activeFile.id }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to delete file");
      }

      setFiles(files.filter(f => f.id !== activeFile.id));
      router.refresh();
      closeDeleteModal();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete file.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">File Name</th>
              <th className="px-6 py-4 font-semibold">Owner</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Size</th>
              <th className="px-6 py-4 font-semibold">Created Date</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {files.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileIcon className="w-8 h-8 text-muted-foreground/50" />
                    <p>No files uploaded in the system yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-foreground max-w-xs truncate" title={file.originalName}>
                    {file.originalName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        {file.user.name || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-muted-foreground/60" />
                        {file.user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {file.mimeType.split('/')[1]?.toUpperCase() || "BIN"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openDeleteModal(file)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-80 group-hover:opacity-100" 
                      title="Force Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && activeFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-1 flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5 animate-bounce" /> Administrative Force Delete
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              You are about to force-delete <span className="font-semibold text-foreground break-all">"{activeFile.originalName}"</span> owned by <span className="font-semibold text-foreground">{activeFile.user.name || activeFile.user.email}</span>. This will physically wipe the file and remove database tracking. This action is irreversible.
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                {actionError}
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={closeDeleteModal}
                className="flex-1 py-3 rounded-xl border border-border hover:bg-muted transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteFile}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Force Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
