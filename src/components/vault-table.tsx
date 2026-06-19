"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Download, Key, Trash2, Share2, X, AlertTriangle, 
  Check, Copy, Clock, ShieldAlert, Loader2, FileIcon
} from "lucide-react";

interface VaultFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: string;
  createdAt: Date | string;
}

interface VaultTableProps {
  files: VaultFile[];
}

export function VaultTable({ files: initialFiles }: VaultTableProps) {
  const router = useRouter();
  const [files, setFiles] = useState<VaultFile[]>(initialFiles);
  
  // Modals state
  const [activeFile, setActiveFile] = useState<VaultFile | null>(null);
  const [modalType, setModalType] = useState<"decrypt" | "share" | "delete" | null>(null);
  
  // Input fields
  const [password, setPassword] = useState("");
  const [expiresInHours, setExpiresInHours] = useState<number>(24);
  const [downloadLimit, setDownloadLimit] = useState<number>(5);
  
  // Results
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const openModal = (file: VaultFile, type: "decrypt" | "share" | "delete") => {
    setActiveFile(file);
    setModalType(type);
    setPassword("");
    setShareUrl("");
    setCopied(false);
    setActionError("");
  };

  const closeModal = () => {
    setActiveFile(null);
    setModalType(null);
    setPassword("");
    setShareUrl("");
    setCopied(false);
    setActionError("");
  };

  // 1. Decrypt and Download file
  const handleDecryptDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFile || !password) return;

    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch("/api/files/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: activeFile.id, password }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Decryption failed. Please check your password.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = activeFile.originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      closeModal();
    } catch (err: any) {
      setActionError(err.message || "An error occurred during decryption.");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Download Raw Encrypted File
  const handleDownloadEncrypted = async (file: VaultFile) => {
    try {
      const res = await fetch("/api/files/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id, raw: true }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to download encrypted file");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.originalName}.enc`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to download raw encrypted file.");
    }
  };

  // 3. Delete File
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

      // Update local state and trigger refresh
      setFiles(files.filter(f => f.id !== activeFile.id));
      router.refresh();
      closeModal();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete file.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Generate share link
  const handleGenerateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFile) return;

    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch("/api/files/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileId: activeFile.id, 
          expiresInHours: Number(expiresInHours), 
          downloadLimit: Number(downloadLimit) 
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to generate share link");
      }

      const data = await res.json();
      setShareUrl(data.shareUrl);
    } catch (err: any) {
      setActionError(err.message || "Failed to share file.");
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">File Name</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Size</th>
              <th className="px-6 py-4 font-semibold">Status</th>
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
                    <p>No files encrypted yet. Upload your first file to get started!</p>
                  </div>
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-foreground max-w-xs truncate" title={file.originalName}>
                    {file.originalName}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {file.mimeType.split('/')[1]?.toUpperCase() || "BIN"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                      <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(file, "decrypt")}
                        className="p-2 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors" 
                        title="Decrypt & Download"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownloadEncrypted(file)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors" 
                        title="Download Encrypted (.enc)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openModal(file, "share")}
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors" 
                        title="Share Securely"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openModal(file, "delete")}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" 
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modals Portal --- */}
      {modalType && activeFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ERROR DISPLAY */}
            {actionError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex gap-2 items-start">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* 1. DECRYPT MODAL */}
            {modalType === "decrypt" && (
              <div>
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-500" /> Decrypt File
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Provide the password used to encrypt <span className="font-semibold text-foreground break-all">"{activeFile.originalName}"</span>.
                </p>

                <form onSubmit={handleDecryptDownload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Decryption Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-cyan-500 outline-none"
                      placeholder="Enter password"
                      required
                      autoFocus
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Decrypt & Download"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* 2. SHARE MODAL */}
            {modalType === "share" && (
              <div>
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-emerald-500" /> Secure Share Link
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Create a self-destructing download link for <span className="font-semibold text-foreground break-all">"{activeFile.originalName}"</span>.
                </p>

                {!shareUrl ? (
                  <form onSubmit={handleGenerateShare} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" /> Link Expiry (Hours)
                        </label>
                        <input 
                          type="number" 
                          value={expiresInHours}
                          onChange={(e) => setExpiresInHours(Math.max(1, Number(e.target.value)))}
                          className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-cyan-500 outline-none"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                          <Download className="w-4 h-4 text-muted-foreground" /> Max Downloads
                        </label>
                        <input 
                          type="number" 
                          value={downloadLimit}
                          onChange={(e) => setDownloadLimit(Math.max(1, Number(e.target.value)))}
                          className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-cyan-500 outline-none"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Generate Link"
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-muted rounded-xl border border-border break-all text-sm font-mono flex items-center justify-between gap-3">
                      <span className="select-all overflow-hidden text-ellipsis whitespace-nowrap flex-1">{shareUrl}</span>
                      <button 
                        onClick={copyToClipboard}
                        className="p-2 bg-card border border-border hover:bg-muted/80 rounded-lg transition-colors text-muted-foreground hover:text-foreground shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Anyone with this link and the encryption password can download this file.
                    </p>
                    <button 
                      onClick={closeModal}
                      className="w-full py-2.5 rounded-xl border border-border hover:bg-muted transition-colors font-medium text-sm"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. DELETE MODAL */}
            {modalType === "delete" && (
              <div>
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" /> Permanent Deletion
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you absolutely sure you want to delete <span className="font-semibold text-foreground break-all">"{activeFile.originalName}"</span>? This will permanently delete the file and all associated sharing links. This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button 
                    onClick={closeModal}
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
                      "Delete File"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
