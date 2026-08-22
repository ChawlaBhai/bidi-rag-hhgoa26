"use client";

import React, { useState } from "react";
import { Mic, Cpu, ShieldCheck, BarChart3, Settings, Sparkles, BookOpen } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sttProvider: string;
  setSttProvider: (provider: string) => void;
  sarvamKey: string;
  setSarvamKey: (key: string) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  sttProvider,
  setSttProvider,
  sarvamKey,
  setSarvamKey
}: NavbarProps) {
  const [showKeyModal, setShowKeyModal] = useState(false);

  return (
    <header className="relative z-30 max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-4 shadow-lg shadow-slate-200/40 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-extrabold text-xl select-none">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">VoiceRAG</span>
              <span className="bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                HH GOA 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Sub-200ms Voice Indic RAG Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab("studio")}
            className={`font-semibold text-xs md:text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "studio"
                ? "bg-white text-indigo-600 shadow-md shadow-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mic className="w-4 h-4" /> Studio & Voice
          </button>

          <button
            onClick={() => setActiveTab("dataset")}
            className={`font-semibold text-xs md:text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "dataset"
                ? "bg-white text-indigo-600 shadow-md shadow-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Scope & Knowledge
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`font-semibold text-xs md:text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "analytics"
                ? "bg-white text-indigo-600 shadow-md shadow-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> P50/70/100 Latency
          </button>

          <button
            onClick={() => setActiveTab("chunking")}
            className={`font-semibold text-xs md:text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "chunking"
                ? "bg-white text-indigo-600 shadow-md shadow-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Cpu className="w-4 h-4" /> 5 Strategies
          </button>

          <button
            onClick={() => setActiveTab("harness")}
            className={`font-semibold text-xs md:text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "harness"
                ? "bg-white text-indigo-600 shadow-md shadow-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Harness & Guards
          </button>
        </nav>

        {/* STT Config Button */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>RAG Engine Online</span>
          </div>

          <button
            onClick={() => setShowKeyModal(!showKeyModal)}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 shadow-sm transition-all cursor-pointer"
            title="STT Engine Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STT Settings Modal */}
      {showKeyModal && (
        <div className="absolute top-24 right-4 z-50 w-84 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl animate-in fade-in space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> STT Engine Settings
            </span>
            <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">STT Provider:</label>
              <select
                value={sttProvider}
                onChange={(e) => setSttProvider(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="webspeech">WebSpeech API (Free 0ms Default - Eng/Hi/Hinglish)</option>
                <option value="sarvam">Sarvam AI (Saaras-v3)</option>
                <option value="elevenlabs">ElevenLabs Scribe</option>
              </select>
            </div>

            {sttProvider === "sarvam" && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sarvam API Key:</label>
                <input
                  type="password"
                  value={sarvamKey}
                  onChange={(e) => setSarvamKey(e.target.value)}
                  placeholder="Paste Sarvam API key..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">If blank, system uses native WebSpeech zero-cost stream.</p>
              </div>
            )}

            <button
              onClick={() => setShowKeyModal(false)}
              className="w-full btn-primary-indigo text-xs py-2.5 mt-2"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
