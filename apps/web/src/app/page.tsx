"use client";

import Link from "next/link";
import {
  ArrowRight,
  Database,
  RefreshCcw,
  Network,
  Lock,
  Zap,
  CheckCircle,
  Terminal,
  FileCode,
} from "lucide-react";
import { motion } from "framer-motion";
import CodeWalkthrough from "@/components/CodeWalkthrough";
import TerminalShowcase from "@/components/TerminalShowcase";
import AnimatedDiagram from "@/components/AnimatedDiagram";
import FrameworkSection from "@/components/FrameworkSection";

export default function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1,
      },
    },
    viewport: { once: true },
  };

  return (
    <main className="flex flex-col min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="w-10 h-10 flex items-center justify-center overflow-hidden"
            >
              <img src="/logo.svg" alt="ZerithDB Logo" className="w-full h-full" />
            </motion.div>
            <span className="font-semibold text-xl tracking-tight">ZerithDB</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/docs" className="hover:text-black transition-colors font-medium">
              Docs
            </Link>
            <Link href="#features" className="hover:text-black transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-black transition-colors">
              How it works
            </Link>
            <Link href="#compare" className="hover:text-black transition-colors">
              Compare
            </Link>
            <Link
              href="/playground"
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" /> Playground
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Zerith-Labs/ZerithDB"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              GitHub
            </a>
            <Link
              href="#get-started"
              className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── 1. HERO SECTION ── */}
      <section className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto text-center">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-visible">
          <motion.div
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-40 -right-20 w-80 h-80 bg-indigo-100 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight text-gray-900">
            Build full-stack apps with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              ZERO backend.
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto text-balance">
            The browser is the server. Local-first, peer-to-peer, CRDT-powered database platform.
            Replace your backend, database, and auth system entirely.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="#get-started"
            className="group flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl font-medium text-base hover:bg-gray-800 transition-all shadow-sm w-full sm:w-auto justify-center"
          >
            Start Building
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/playground"
            className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-6 py-3.5 rounded-xl font-medium text-base hover:bg-blue-100 transition-all w-full sm:w-auto justify-center shadow-sm"
          >
            <Zap className="w-4 h-4 animate-pulse" />
            Try Playground
          </Link>
          <a
            href="https://github.com/Zerith-Labs/ZerithDB"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-white text-gray-900 border border-gray-200 px-6 py-3.5 rounded-xl font-medium text-base hover:bg-gray-50 transition-all w-full sm:w-auto justify-center shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            GitHub
          </a>
        </motion.div>

        {/* ── FRAMEWORKS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <FrameworkSection />
        </motion.div>

        {/* Hero Code Snippet / Terminal Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16 mx-auto max-w-4xl text-left"
        >
          <TerminalShowcase />
        </motion.div>
      </section>

      {/* ── 2. TRUST / SOCIAL PROOF ── */}
      <section className="py-10 border-y border-gray-100 bg-gray-50/50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale"
        >
          <div className="flex items-center gap-2 font-semibold text-lg text-gray-800">
            <Terminal className="w-5 h-5" /> Open Source
          </div>
          <div className="flex items-center gap-2 font-semibold text-lg text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>{" "}
            Built for Developers
          </div>
          <div className="flex items-center gap-2 font-semibold text-lg text-gray-800">
            <Zap className="w-5 h-5" /> Zero Latency
          </div>
        </motion.div>
      </section>

      {/* ── INTERACTIVE CODE SECTION ── */}
      <section className="py-24 px-6 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="mb-12 md:text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Developer Experience First
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              A powerful, fully-typed SDK that feels like magic. No configuration required.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <CodeWalkthrough />
          </motion.div>
        </div>
      </section>

      {/* ── 3. CORE FEATURES ── */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="mb-16 md:text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Stop managing infrastructure. ZerithDB provides the entire data layer right inside the
              client.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
          >
            {[
              {
                icon: Database,
                title: "Local-First Database",
                desc: "Data lives in IndexedDB. Instant reads, instant writes, and full offline capabilities by default.",
              },
              {
                icon: Network,
                title: "Real-time P2P Sync",
                desc: "Browsers connect directly via WebRTC. No central server bottleneck. Zero-latency data transfer.",
              },
              {
                icon: RefreshCcw,
                title: "CRDT Conflict Resolution",
                desc: "Powered by Yjs. Mathematical guarantee of eventual consistency without annoying merge conflicts.",
              },
              {
                icon: Lock,
                title: "Passwordless Auth",
                desc: "Ed25519 cryptographic keypairs generated in-browser. You are identified by your public key. No login servers.",
              },
              {
                icon: Zap,
                title: "Zero Backend",
                desc: "No database provisioning, no API routes to write, no GraphQL resolvers. Just import and build.",
              },
              {
                icon: FileCode,
                title: "TypeScript Native",
                desc: "End-to-end type safety. Your database schemas are strictly typed from creation to query.",
              },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-900 group-hover:border-blue-200 group-hover:shadow-md transition-all">
                  <feature.icon className="w-6 h-6 stroke-[1.5] group-hover:text-blue-600 transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS / DIAGRAM ── */}
      <section id="how-it-works" className="py-24 px-6 bg-white border-y border-gray-200/50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">How it works</h2>
            <p className="mt-4 text-gray-500 text-lg">
              A simple, powerful data flow entirely in the browser.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <AnimatedDiagram />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto"
          >
            {[
              {
                step: "01",
                title: "Write Locally",
                desc: "Call insert(). Data is instantly persisted to IndexedDB. The UI updates in 0ms.",
              },
              {
                step: "02",
                title: "Convert to CRDT",
                desc: "ZerithDB translates the JSON document into a highly compressed binary CRDT delta.",
              },
              {
                step: "03",
                title: "Sync P2P",
                desc: "The delta is cryptographically signed and broadcasted via WebRTC to connected peers.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="flex-1 bg-gray-50 p-8 rounded-2xl border border-gray-100 relative w-full text-center md:text-left hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm mb-6 shadow-md mx-auto md:mx-0">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 5. PERFORMANCE BENCHMARKS ── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp} className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Unbeatable Latency
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Because data never leaves the device for reads/writes, ZerithDB operates at the speed
              of RAM and SSD, not the speed of the internet.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200"
          >
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
              Average Write Latency (ms)
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-900">Firebase (Managed Cloud)</span>
                  <span className="text-gray-500">~65ms</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "65%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="bg-orange-400 h-3 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-900">Supabase (Managed Cloud)</span>
                  <span className="text-gray-500">~45ms</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "45%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="bg-green-500 h-3 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-900 font-bold flex items-center gap-2">
                    ZerithDB (Local-first){" "}
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      Fastest
                    </span>
                  </span>
                  <span className="text-blue-600 font-bold">~0.5ms</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "2%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="bg-blue-600 h-3 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 6. COMPARISON SECTION ── */}
      <section id="compare" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              The Modern Data Layer
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              See how ZerithDB compares to traditional architectures.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm"
            tabIndex={0}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-900 border-b border-gray-200">
                  <th className="py-4 px-6 font-semibold w-1/4">Feature</th>
                  <th className="py-4 px-6 font-semibold w-1/4">Firebase</th>
                  <th className="py-4 px-6 font-semibold w-1/4">Supabase</th>
                  <th className="py-4 px-6 font-bold text-blue-600 bg-blue-50/50 w-1/4">
                    ZerithDB
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  {
                    feature: "Backend Required",
                    fb: "Yes (Managed)",
                    sb: "Yes (Managed)",
                    zdb: "No (Browser-only)",
                  },
                  {
                    feature: "Offline-First",
                    fb: "Limited / Add-on",
                    sb: "Via external libs",
                    zdb: "Native Default",
                  },
                  {
                    feature: "Sync Architecture",
                    fb: "Client-Server",
                    sb: "Client-Server",
                    zdb: "Peer-to-Peer",
                  },
                  {
                    feature: "Conflict Resolution",
                    fb: "Last-write-wins",
                    sb: "PostgreSQL rules",
                    zdb: "CRDTs (Deterministic)",
                  },
                  {
                    feature: "Vendor Lock-in",
                    fb: "High",
                    sb: "Low (Open Source)",
                    zdb: "None (Runs in client)",
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors bg-white"
                  >
                    <td className="py-4 px-6 text-gray-900 font-medium">{row.feature}</td>
                    <td className="py-4 px-6 text-gray-500">{row.fb}</td>
                    <td className="py-4 px-6 text-gray-500">{row.sb}</td>
                    <td className="py-4 px-6 text-gray-900 font-semibold bg-blue-50/30">
                      {row.zdb}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ── 7. USE CASES ── */}
      <section id="use-cases" className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="mb-16 md:text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Built for the next generation of apps
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {[
              {
                title: "Collaborative Tools",
                desc: "Build Figma-like or Notion-like experiences where multiple users edit the same document seamlessly without conflict.",
              },
              {
                title: "Offline-First Applications",
                desc: "Applications for field workers, travelers, or unstable networks that must never show a loading spinner.",
              },
              {
                title: "Local Productivity Apps",
                desc: "Notes, to-do lists, and personal wikis that guarantee 100% privacy because data never hits a central database.",
              },
              {
                title: "Multiplayer Games & Systems",
                desc: "Share game state or real-time presence (cursors, selections) across peers instantly via WebRTC data channels.",
              },
            ].map((uc, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white border border-gray-200 shadow-sm p-8 rounded-2xl hover:shadow-md hover:border-blue-200 transition-all cursor-default"
              >
                <CheckCircle className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{uc.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 9. CTA SECTION ── */}
      <section
        id="get-started"
        className="py-32 px-6 bg-white text-center relative overflow-hidden"
      >
        {/* Abstract shapes for CTA */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-black rounded-full rotate-45 animate-float" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-black rounded-xl -rotate-12 animate-float-delayed" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 text-balance">
            Start building without a backend today.
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            Open source. Developer first. Ready for production.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com/Zerith-Labs/ZerithDB"
              className="bg-black text-white px-8 py-4 rounded-xl font-medium text-base hover:bg-gray-800 transition-all shadow-lg w-full sm:w-auto"
            >
              npm install zerithdb-sdk
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com/Zerith-Labs/ZerithDB"
              target="_blank"
              rel="noreferrer"
              className="bg-gray-100 text-gray-900 px-8 py-4 rounded-xl font-medium text-base hover:bg-gray-200 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              Star on GitHub
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* ── 9. FOOTER ── */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo.svg" alt="ZerithDB Logo" className="w-full h-full" />
            </div>
            <span className="font-semibold text-gray-900 text-lg">ZerithDB</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
            <Link href="/docs" className="hover:text-gray-900 transition-colors">
              Documentation
            </Link>
            <a
              href="https://github.com/Zerith-Labs/ZerithDB"
              className="hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
            <Link href="/blog" className="hover:text-gray-900 transition-colors">
              Blog
            </Link>
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <a href="#" className="hover:text-gray-900 transition-colors">
              Discord
            </a>
          </div>

          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} ZerithDB. Open Source.
          </div>
        </div>
      </footer>
    </main>
  );
}
