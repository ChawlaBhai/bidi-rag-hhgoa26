"use client";

import React, { useState } from "react";
import { Cpu, Check, Layers } from "lucide-react";

export default function ChunkingPlayground() {
  const [activeStrategy, setActiveStrategy] = useState("parent_child");

  const strategies = [
    {
      key: "parent_child",
      title: "Parent-Child Hierarchy",
      badge: "★ Production Winner",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      description: "Parent chunks (~350 tokens) provide context for generation, while Child chunks (~90 tokens) enable sharp vector similarity search.",
      r5: "0.24",
      r10: "0.31",
      mrr: "0.19"
    },
    {
      key: "semantic_boundaries",
      title: "Semantic Boundaries",
      badge: "Sentence Cohesion",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      description: "Groups adjacent sentences by evaluating cosine similarity drops across sentence boundaries to preserve topic continuity.",
      r5: "0.21",
      r10: "0.28",
      mrr: "0.16"
    },
    {
      key: "metadata_aware",
      title: "Metadata-Aware Structural",
      badge: "Indic Tagged",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "Embeds language metadata tags ([LANG: hi]), document titles, and section headers into every chunk to preserve structural context.",
      r5: "0.22",
      r10: "0.29",
      mrr: "0.17"
    },
    {
      key: "dynamic_overlap",
      title: "Dynamic Overlap Window",
      badge: "Sliding Window",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Fixed 40-word sliding window with a configurable 25% overlap percentage across passage tokens.",
      r5: "0.19",
      r10: "0.25",
      mrr: "0.14"
    },
    {
      key: "canonical_passage",
      title: "Canonical Passage Baseline",
      badge: "Naive Baseline",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      description: "Original raw MSMARCO-XI passages evaluated as single un-split chunks for baseline benchmark comparison.",
      r5: "0.17",
      r10: "0.23",
      mrr: "0.12"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 font-sans">
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 font-semibold text-xs px-3.5 py-1.5 rounded-full border border-indigo-200/60">
          <Cpu className="w-4 h-4 text-indigo-600" /> REQUIREMENT #2: VAST CHUNKING STRATEGIES
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          5 Chunking Strategies Evaluated
        </h2>
        <p className="text-slate-600 text-sm max-w-3xl mx-auto">
          We evaluate multiple chunking strategies over the MSMARCO-XI split to compare Recall@K, MRR@10, and retrieval precision.
        </p>
      </section>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strat) => (
          <div
            key={strat.key}
            onClick={() => setActiveStrategy(strat.key)}
            className={`bg-white rounded-3xl p-6 border shadow-lg shadow-slate-200/50 flex flex-col justify-between cursor-pointer transition-all ${
              activeStrategy === strat.key
                ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl"
                : "border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${strat.color}`}>
                  {strat.badge}
                </span>
                {activeStrategy === strat.key && (
                  <span className="text-indigo-600 font-bold text-xs">Selected</span>
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{strat.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{strat.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Recall@5</span>
                <span className="font-extrabold text-sm text-slate-900">{strat.r5}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Recall@10</span>
                <span className="font-extrabold text-sm text-slate-900">{strat.r10}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">MRR@10</span>
                <span className="font-extrabold text-sm text-slate-900">{strat.mrr}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
