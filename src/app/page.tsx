"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Lock, FileKey, Activity, Users, Zap, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 bg-blue-500 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-border bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              CryptoShield
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-md hover:bg-foreground/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Enterprise-Grade Security
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Protect Every File With <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                  Military Grade Encryption
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Secure your sensitive documents using AES-256 encryption and advanced PBKDF2 password derivation. Your files, your keys, complete privacy.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/register" className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-[0_0_20px_-5px_rgba(8,145,178,0.5)]">
                  Start Encrypting <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="#demo" className="px-6 py-3 rounded-lg font-medium border border-border hover:bg-foreground/5 transition-colors">
                  View Live Demo
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:h-[500px] flex items-center justify-center"
            >
              {/* Abstract Encryption Visual */}
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-4 rounded-full border border-blue-500/30 animate-[spin_15s_linear_infinite_reverse]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl rotate-12 flex items-center justify-center shadow-[0_0_40px_rgba(8,145,178,0.4)] backdrop-blur-xl">
                    <Lock className="w-16 h-16 text-white" />
                  </div>
                </div>
                {/* Floating elements */}
                <motion.div 
                  animate={{ y: [-10, 10, -10] }} 
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute top-10 left-10 p-3 bg-zinc-900/80 border border-white/10 rounded-xl backdrop-blur-md"
                >
                  <FileKey className="w-6 h-6 text-cyan-400" />
                </motion.div>
                <motion.div 
                  animate={{ y: [10, -10, 10] }} 
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute bottom-10 right-10 p-3 bg-zinc-900/80 border border-white/10 rounded-xl backdrop-blur-md"
                >
                  <Shield className="w-6 h-6 text-blue-400" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trusted By */}
        <section className="border-y border-white/5 bg-white/[0.02] py-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-slate-500 mb-6 uppercase tracking-wider">Trusted by innovative teams worldwide</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
              {/* Dummy logos */}
              {['Acme Corp', 'GlobalTech', 'CyberSys', 'SecureNet', 'DevWorks'].map((logo, i) => (
                <div key={i} className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5" /> {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Uncompromising Security Features</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to secure your data pipeline, built right in.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: "AES-256-GCM Encryption", desc: "Military-grade authenticated encryption standard to prevent tampering." },
              { icon: FileKey, title: "PBKDF2 Derivation", desc: "Advanced password hashing to protect against brute-force attacks." },
              { icon: Shield, title: "Secure File Storage", desc: "Isolated environment for your encrypted artifacts with strict access control." },
              { icon: Activity, title: "Comprehensive Audit Logs", desc: "Track every encryption, decryption, and access attempt in real-time." },
              { icon: Users, title: "Secure Sharing", desc: "Generate time-limited, password-protected links for secure distribution." },
              { icon: Zap, title: "Real-time Analytics", desc: "Monitor your organization's security posture with a centralized dashboard." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-cyan-500/30 hover:bg-zinc-900 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="font-bold text-lg">CryptoShield</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 CryptoShield. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
