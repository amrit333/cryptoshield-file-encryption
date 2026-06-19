"use client";

import { useState } from "react";
import { Lock, Download, Key, ShieldAlert, Loader2, ShieldCheck } from "lucide-react";

interface ShareDownloadFormProps {
  token: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export function ShareDownloadForm({ token, fileName, fileSize, mimeType }: ShareDownloadFormProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/files/share/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Incorrect decryption password");
      }

      // Download file stream
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess(true);
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to decrypt shared file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-xl relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-cyan-500 blur-2xl rounded-full pointer-events-none"></div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
          <Lock className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-center text-foreground">Secure File Access</h1>
        <p className="text-muted-foreground text-sm text-center mt-1">This file is encrypted with military-grade protection.</p>
      </div>

      {error && (
        <div className="p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center flex items-center gap-2 justify-center">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 mb-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center flex items-center gap-2 justify-center">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Decrypted and downloaded successfully!</span>
        </div>
      )}

      {/* File Details Box */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border mb-6 flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">File Name</span>
          <span className="font-semibold text-foreground truncate max-w-[200px]" title={fileName}>
            {fileName}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">File Size</span>
          <span className="font-semibold text-foreground">{formatSize(fileSize)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Type</span>
          <span className="font-semibold text-foreground uppercase">{mimeType.split("/")[1] || "BIN"}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Enter Password to Decrypt</label>
          <div className="relative">
            <input 
              type="password" 
              required
              placeholder="Decryption password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-cyan-500 outline-none text-foreground placeholder:text-muted-foreground/60 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <Key className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-cyan-950/20 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Decrypting...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Decrypt & Download</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
