"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, UploadCloud, Lock } from "lucide-react";

export function EncryptModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !password) {
      setError("Please provide both a file and a password.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to encrypt file");
      }

      setIsOpen(false);
      setFile(null);
      setPassword("");
      router.refresh(); // Refresh the page to show new file
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Encrypt New File
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-500" /> Secure Encryption
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Upload a file and encrypt it with a password. You will need this exact password to decrypt it later.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select File</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground px-4 text-center">
                      {file ? <span className="font-semibold text-cyan-500 break-all">{file.name}</span> : "Click to upload or drag and drop"}
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Encryption Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="Enter a strong password"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Encrypt & Upload"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
