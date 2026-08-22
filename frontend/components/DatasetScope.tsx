"use client";

import React from "react";
import { BookOpen, Rocket, Landmark, Cpu, Atom, Scroll, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";

interface DatasetScopeProps {
  onSelectQuery?: (q: string) => void;
}

export default function DatasetScope({ onSelectQuery }: DatasetScopeProps) {
  const domains = [
    {
      icon: Rocket,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      accent: "text-indigo-600",
      title: "Science & Space Exploration",
      description: "Covers ISRO missions (Chandrayaan-3 South Pole landing), Photosynthesis processes, DNA Double Helix discovery, and biological mechanisms.",
      samples: [
        "चंद्रयान-3 मिशन की मुख्य सफलता क्या थी?",
        "प्रकाश संश्लेषण (Photosynthesis) की प्रक्रिया क्या है?",
        "Who discovered the double helix structure of DNA?"
      ]
    },
    {
      icon: Landmark,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      accent: "text-amber-600",
      title: "Indian History & Goa Liberation 1961",
      description: "Covers Operation Vijay 1961 (Goa Liberation), Manhattan Project WWII impact, and Maratha Empire under Chhatrapati Shivaji Maharaj.",
      samples: [
        "When was Goa liberated from Portuguese rule?",
        "मैनहटन प्रोजेक्ट का तत्काल प्रभाव क्या था?",
        "छत्रपती शिवाजी महाराजांची राजधानी कोणती होती?"
      ]
    },
    {
      icon: Scroll,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accent: "text-emerald-600",
      title: "Indian Constitution & Civics",
      description: "Covers the drafting of the Constitution of India, Dr. B.R. Ambedkar's committee, adoption date (26 Nov 1949), and enforcement (26 Jan 1950).",
      samples: [
        "भारतीय संविधान कब लागू हुआ और इसे बनने में कितना समय लगा?",
        "Who chaired the drafting committee of the Indian Constitution?"
      ]
    },
    {
      icon: Cpu,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      accent: "text-purple-600",
      title: "Quantum Computing & AI Neural Networks",
      description: "Covers Qubits vs classical binary bits, Superposition & Entanglement, Neural Networks, Forward Propagation, and Backpropagation algorithms.",
      samples: [
        "How do qubits differ from classical bits in quantum computing?",
        "Neural networks kaise kaam karte hain in artificial intelligence?"
      ]
    },
    {
      icon: Atom,
      color: "bg-rose-50 text-rose-600 border-rose-100",
      accent: "text-rose-600",
      title: "Literature & Indic Cultural Heritage",
      description: "Covers Thirukkural by Thiruvalluvar (1330 verses across 3 main sections) and cultural heritage history.",
      samples: [
        "திருக்குறளை எழுதியவர் யார் மற்றும் அதன் அமைப்பு என்ன?"
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 font-sans">
      {/* Header Banner */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 font-semibold text-xs px-3.5 py-1.5 rounded-full border border-indigo-200/60">
          <BookOpen className="w-4 h-4" /> MSMARCO-XI KNOWLEDGE SCOPE & CAPABILITIES
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          What Can You Ask Our RAG Pipeline?
        </h2>
        <p className="text-slate-600 text-sm md:text-base max-w-3xl mx-auto">
          Our system is indexed over a high-density Indic subset of <span className="font-semibold text-indigo-600">ai4bharat/MSMARCO-XI</span>. Explore the exact topics below to get grounded, 100% authentic answers without hallucinations.
        </p>
      </section>

      {/* Domain Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((dom, idx) => {
          const Icon = dom.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${dom.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{dom.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{dom.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Click Sample Question to Test:
                </span>
                <div className="space-y-1.5">
                  {dom.samples.map((s, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => onSelectQuery && onSelectQuery(s)}
                      className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/60 text-xs font-medium text-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate pr-2">“{s}”</span>
                      <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Off-Topic Refusal Scope Guide Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
              <ShieldAlert className="w-4 h-4" /> Off-Topic Refusal Policy
            </div>
            <h3 className="font-extrabold text-xl mb-2">Out-of-Scope Requests Are Refused</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If a question falls outside our 5 trained knowledge domains (e.g. food recipes, coding scripts, crypto prices, sports scores, general trivia), our system strictly refuses with an explanation rather than making up ungrounded answers.
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-xs text-slate-200 space-y-1">
            <span className="font-bold text-amber-300 block">Sample Refusal Response:</span>
            <p className="italic text-[11px]">
              “This question is outside our dataset's knowledge scope. Our RAG engine is trained specifically on Indian History, Science, Constitution, Quantum & Tech.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
