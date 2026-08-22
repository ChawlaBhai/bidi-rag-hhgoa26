'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Search, Database, Cpu, Clock, History, AlertCircle, Zap, Shield, FileText, Activity, Server, ArrowRight } from 'lucide-react';
import Image from 'next/image';

type Message = {
  id: string;
  query: string;
  answer: string;
  status?: string;
  citations: any[];
  telemetry: any;
  timestamp: Date;
};

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [interimText, setInterimText] = useState('');
  const [sttProvider, setSttProvider] = useState<'webspeech' | 'sarvam'>('webspeech');
  const [language, setLanguage] = useState('en-US');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 8 stages
  const [pipelineStage, setPipelineStage] = useState<number>(0);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [hoverScope, setHoverScope] = useState<string | null>(null);

  
  const [sarvamSecondsUsed, setSarvamSecondsUsed] = useState(0);
  const MAX_SARVAM_SECONDS = 60;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  // Spacebar logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (!isRecording && !isLoading) {
          startRecording();
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, isLoading]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('rag_history');
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {}
    }
    
    const today = new Date().toDateString();
    const storedUsage = localStorage.getItem('sarvam_usage');
    if (storedUsage) {
      try {
        const parsed = JSON.parse(storedUsage);
        if (parsed.date === today) {
          setSarvamSecondsUsed(parsed.seconds);
        } else {
          localStorage.setItem('sarvam_usage', JSON.stringify({ date: today, seconds: 0 }));
        }
      } catch(e) {}
    } else {
      localStorage.setItem('sarvam_usage', JSON.stringify({ date: today, seconds: 0 }));
    }

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rag_history', JSON.stringify(messages));
  }, [messages]);

  const updateSarvamUsage = (seconds: number) => {
    const today = new Date().toDateString();
    const newTotal = sarvamSecondsUsed + seconds;
    setSarvamSecondsUsed(newTotal);
    localStorage.setItem('sarvam_usage', JSON.stringify({ date: today, seconds: newTotal }));
  };

  const simulatePipeline = async (finalQuery: string) => {
    // Stage 3: Intent Guardrail
    setPipelineStage(3);
    await new Promise(r => setTimeout(r, 100));
    // Stage 4: Strategy
    setPipelineStage(4);
    await new Promise(r => setTimeout(r, 100));
    // Stage 5: Hybrid Retrieval
    setPipelineStage(5);
    await new Promise(r => setTimeout(r, 300));
    // Stage 6: RRF
    setPipelineStage(6);
    await new Promise(r => setTimeout(r, 100));
    // Stage 7: Evidence Verif
    setPipelineStage(7);
    await new Promise(r => setTimeout(r, 150));
    // Stage 8: Gen
    setPipelineStage(8);
  };

  const processQuery = async (queryText: string = '', audioBlob?: Blob) => {
    setIsLoading(true);
    if (!audioBlob) {
      // If it's text, we skip STT visually
      simulatePipeline(queryText);
    }
    const formData = new FormData();
    formData.append('stt_provider', sttProvider);
    formData.append('language', language);
    
    const sttDuration = recordingStartTimeRef.current > 0 ? Date.now() - recordingStartTimeRef.current : 0;
    formData.append('stt_latency_ms', sttDuration.toString());

    if (audioBlob) {
      formData.append('audio', audioBlob, 'speech.webm');
    } else {
      formData.append('text', queryText);
    }

    try {
      simulatePipeline("Processing RAG...");
      const res = await fetch('/api/ask', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();

      const newMessage: Message = {
        id: Date.now().toString(),
        query: data.transcription || queryText || "No speech recognized. Please speak clearly into your microphone.",
        answer: data.answer,
        citations: data.citations || [],
        telemetry: data.telemetry || {},
        timestamp: new Date()
      };
      
      setMessages(prev => [newMessage, ...prev]);
    } catch (error) {
      console.error(error);
      alert("Error processing request. Ensure backend is running.");
    } finally {
      setIsLoading(false);
      setPipelineStage(0);
      setTextInput('');
      setInterimText('');
      transcriptRef.current = '';
    }
  };

  const startRecording = async () => {
    if (sttProvider === 'sarvam' && sarvamSecondsUsed >= MAX_SARVAM_SECONDS) {
      alert("Daily Sarvam limit (60s) reached. Switching to WebSpeech.");
      setSttProvider('webspeech');
      return;
    }

    setPipelineStage(1);
    setIsRecording(true);
    setTextInput('');
    setInterimText('');
    transcriptRef.current = '';
    recordingStartTimeRef.current = Date.now();

    if (sttProvider === 'webspeech') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = language;
          recognitionRef.current.onresult = (event: any) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
              } else {
                interim += event.results[i][0].transcript;
              }
            }
            if (final) {
              transcriptRef.current += (transcriptRef.current ? ' ' : '') + final;
              setTextInput(transcriptRef.current);
            }
            setInterimText(interim);
          };
          recognitionRef.current.start();
        } catch (e) {}
      }
    } else {
      // Pure Sarvam AI mode: capture raw audio via MediaRecorder
      setInterimText('🎙️ Recording voice for Sarvam AI Indic STT...');
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          simulatePipeline("Transcribing with Sarvam AI saaras:v3...");
          processQuery('', audioBlob);
        };

        mediaRecorder.start(100);
      } catch (err) {
        setIsRecording(false);
        setPipelineStage(0);
      }
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setPipelineStage(2); // STT stage
    
    if (sttProvider === 'webspeech') {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setTimeout(() => {
        const fullCaptured = (transcriptRef.current + ' ' + interimText).trim();
        if (fullCaptured) {
          processQuery(fullCaptured);
        } else {
          setPipelineStage(0);
        }
      }, 300);
    } else if (mediaRecorderRef.current) {
      const durationSeconds = (Date.now() - recordingStartTimeRef.current) / 1000;
      updateSarvamUsage(durationSeconds);
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    processQuery(textInput);
  };

  const submitSampleQuery = (query: string) => {
  setTextInput(query);
    processQuery(query);
  };

  return (
    <div className="min-h-screen p-3 md:p-4 flex flex-col md:flex-row gap-4 max-w-[1550px] mx-auto text-ink font-sans text-xs">
      
      {/* LEFT COLUMN: Logo, Settings, Info */}
      <div className="w-full md:w-[280px] flex flex-col gap-2.5 shrink-0">
        
        {/* Logo & Header */}
        <div className="border-2 border-ink shadow-neo rounded-xl p-3 bg-[#F0F5FF] text-accent-blue text-center flex flex-col items-center">
          <div className="w-full flex items-center justify-center p-1 mb-1">
            <Image src="/logo.png" alt="VoiceRAG Logo" width={160} height={45} className="object-contain" />
          </div>
          <h1 className="text-lg font-bold tracking-tight selection:bg-accent-pink selection:text-white">VoiceRAG</h1>
          <p className="font-mono text-[10px] opacity-90">Participation by Sahaj Chawla</p>
          <div className="mt-1 text-[9px] uppercase font-bold tracking-widest opacity-80 border-t border-accent-blue/20 pt-1 w-full">HH Goa 2026</div>
        </div>

        {/* Engine Settings */}
        <div className="neo-container p-3">
          <h2 className="text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2 border-b-2 border-ink pb-1.5">
            <Zap className="w-3.5 h-3.5 text-accent-orange" /> STT Engine
          </h2>
          <div className="space-y-2.5 font-mono text-[11px]">
            <div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSttProvider('webspeech')}
                  className={`flex-1 py-1 border-2 border-ink rounded font-bold transition-all ${sttProvider === 'webspeech' ? 'bg-ink text-white shadow-neo' : 'bg-white hover:bg-gray-100'}`}
                >WebSpeech</button>
                <button 
                  onClick={() => { setSttProvider('sarvam'); setLanguage('auto'); }}
                  className={`flex-1 py-1 border-2 border-ink rounded font-bold transition-all ${sttProvider === 'sarvam' ? 'bg-accent-pink text-white shadow-neo' : 'bg-white hover:bg-gray-100'}`}
                >Sarvam AI</button>
              </div>
            </div>
            {sttProvider === 'sarvam' ? (
              <div className="p-1.5 bg-red-50 border-2 border-red-200 rounded text-red-800 font-bold h-9 flex flex-col justify-center text-[10px]">
                Limit: {Math.min(60, Math.round(sarvamSecondsUsed))}s / 60s
                <div className="w-full bg-red-200 h-1 mt-0.5 rounded-full overflow-hidden">
                  <div className="bg-accent-pink h-full transition-all" style={{ width: `${(sarvamSecondsUsed / MAX_SARVAM_SECONDS) * 100}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="p-1.5 bg-green-50 border-2 border-green-200 rounded text-green-800 font-bold h-9 flex flex-col justify-center text-[10px]">
                Limit: Unlimited (Local)
                <div className="w-full bg-green-200 h-1 mt-0.5 rounded-full overflow-hidden">
                  <div className="bg-accent-green h-full w-full"></div>
                </div>
              </div>
            )}
            <div>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-white border-2 border-ink p-1 rounded focus:outline-none focus:shadow-neo font-bold">
                {sttProvider === 'sarvam' ? (
                  <option value="auto">✨ Auto-Detect (10+ Indic Languages)</option>
                ) : (
                  <>
                    <option value="en-US">English (US)</option>
                    <option value="hi-IN">Hindi / Hinglish (IN)</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Knowledge Scope */}
        <div className="neo-container p-3 bg-[#FDF8F5]">
          <h2 className="text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2 border-b-2 border-ink pb-1.5">
            <Database className="w-3.5 h-3.5 text-accent-blue" /> Knowledge Scope
          </h2>
          <p className="font-mono text-[9px] mb-1.5 font-medium opacity-80 leading-tight">
            Curated <strong>ai4bharat/MSMARCO-XI</strong> dataset.
          </p>
          <ul className="text-[10px] font-mono space-y-1 relative">
            <li className="flex items-center gap-1.5 cursor-help hover:font-bold transition-all relative group">
              <div className="w-2 h-2 rounded-full bg-accent-blue"></div> Science & Physics
              <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-ink p-2 rounded shadow-neo-hover z-20 hidden group-hover:block text-[9px] font-normal">
                <strong>Ask about:</strong><br/>• DNA double helix<br/>• Quantum qubits
              </div>
            </li>
            <li className="flex items-center gap-1.5 cursor-help hover:font-bold transition-all relative group">
              <div className="w-2 h-2 rounded-full bg-accent-pink"></div> Goa Liberation History
              <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-ink p-2 rounded shadow-neo-hover z-20 hidden group-hover:block text-[9px] font-normal">
                <strong>Ask about:</strong><br/>• Goa 1961 liberation<br/>• Operation Vijay
              </div>
            </li>
            <li className="flex items-center gap-1.5 cursor-help hover:font-bold transition-all relative group">
              <div className="w-2 h-2 rounded-full bg-accent-green"></div> Indian Constitution
              <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-ink p-2 rounded shadow-neo-hover z-20 hidden group-hover:block text-[9px] font-normal">
                <strong>Ask about:</strong><br/>• Adoption dates<br/>• Dr. B.R. Ambedkar
              </div>
            </li>
            <li className="flex items-center gap-1.5 cursor-help hover:font-bold transition-all relative group">
              <div className="w-2 h-2 rounded-full bg-accent-orange"></div> Culture & Tech
              <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-ink p-2 rounded shadow-neo-hover z-20 hidden group-hover:block text-[9px] font-normal">
                <strong>Ask about:</strong><br/>• Neural Networks<br/>• Thirukkural author
              </div>
            </li>
          </ul>
        </div>
        
        {/* Guardrails */}
        <div className="neo-container p-3 bg-[#F5F8FD]">
          <h2 className="text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2 border-b-2 border-ink pb-1.5">
            <Shield className="w-3.5 h-3.5 text-accent-blue" /> 4-Layer Guardrails
          </h2>
          <div className="flex flex-col gap-1 font-mono text-[9px] font-bold">
            <div 
              className={`p-1 border border-ink rounded cursor-pointer transition-colors ${activeTooltip === 'g1' ? 'bg-blue-100' : 'bg-white hover:bg-blue-50'}`}
              onClick={() => setActiveTooltip(activeTooltip === 'g1' ? null : 'g1')}
            >
              1. Input Intent & Toxicity Filter
              {activeTooltip === 'g1' && <div className="mt-1 font-normal text-ink/80 pt-1 border-t border-ink/20">Prevents prompt injection and offensive topics.</div>}
            </div>
            <div 
              className={`p-1 border border-ink rounded cursor-pointer transition-colors ${activeTooltip === 'g2' ? 'bg-blue-100' : 'bg-white hover:bg-blue-50'}`}
              onClick={() => setActiveTooltip(activeTooltip === 'g2' ? null : 'g2')}
            >
              2. Dataset Scope Boundary Check
              {activeTooltip === 'g2' && <div className="mt-1 font-normal text-ink/80 pt-1 border-t border-ink/20">Verifies query belongs to 4 dataset domains.</div>}
            </div>
            <div 
              className={`p-1 border border-ink rounded cursor-pointer transition-colors ${activeTooltip === 'g3' ? 'bg-blue-100' : 'bg-white hover:bg-blue-50'}`}
              onClick={() => setActiveTooltip(activeTooltip === 'g3' ? null : 'g3')}
            >
              3. Retrieval Groundedness Threshold
              {activeTooltip === 'g3' && <div className="mt-1 font-normal text-ink/80 pt-1 border-t border-ink/20">Ensures vectors meet strict RRF confidence.</div>}
            </div>
            <div 
              className={`p-1 border border-ink rounded cursor-pointer transition-colors ${activeTooltip === 'g4' ? 'bg-blue-100' : 'bg-white hover:bg-blue-50'}`}
              onClick={() => setActiveTooltip(activeTooltip === 'g4' ? null : 'g4')}
            >
              4. Sentence-Level Citation Tagger
              {activeTooltip === 'g4' && <div className="mt-1 font-normal text-ink/80 pt-1 border-t border-ink/20">Identifies exact source document passage.</div>}
            </div>
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Hero Mic + Query Stream */}
      <div className="flex-1 flex flex-col gap-4 h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar pr-1">
        
        {/* Interaction Hero Card (Single Input) */}
        <div className="neo-container p-5 bg-white relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] shrink-0">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-accent-pink/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col items-center gap-4 z-10 w-full max-w-lg">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`w-24 h-24 rounded-full border-3 border-ink shadow-neo flex items-center justify-center transition-all duration-200 relative ${
                isRecording 
                  ? 'bg-accent-pink text-white scale-[1.05] shadow-none translate-y-1' 
                  : 'bg-white hover:bg-gray-50 hover:shadow-neo-hover'
              }`}
            >
              {isRecording && <div className="absolute inset-0 rounded-full border-3 border-accent-pink animate-ping opacity-50"></div>}
              {isRecording ? <Square className="w-7 h-7" fill="currentColor" /> : <Mic className="w-9 h-9" />}
            </button>
            <p className="font-mono text-xs font-bold bg-ink text-white px-3 py-0.5 rounded-full shadow-neo-hover">
              {isRecording ? 'Release Spacebar to send' : 'Hold Spacebar or Click to speak'}
            </p>

            <form onSubmit={handleTextSubmit} className="w-full flex gap-2 mt-1">
              <input 
                type="text" 
                value={textInput + interimText}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Or type your question manually..."
                className="neo-input flex-1 font-mono text-xs border-2 p-2 rounded"
                disabled={isRecording || isLoading}
              />
              <button type="submit" disabled={isRecording || isLoading || !(textInput+interimText).trim()} className="neo-button-blue px-3 py-2 rounded">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="neo-container p-4 border-dashed border-2 border-accent-blue bg-blue-50/50 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full border-2 border-accent-blue border-t-transparent animate-spin"></div>
              <span className="font-mono text-xs font-bold text-accent-blue">Synthesizing Answer & Evidence...</span>
            </div>
            <div className="space-y-2">
              <div className="h-2.5 bg-blue-200/50 rounded w-full"></div>
              <div className="h-2.5 bg-blue-200/50 rounded w-4/6"></div>
            </div>
          </div>
        )}

        {/* Query Results Feed */}
        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={idx} className="neo-container overflow-hidden animate-fade-in selection:bg-accent-pink selection:text-white">
              
              {/* Query Header */}
              <div className="bg-ink text-white p-3 font-mono flex justify-between items-center selection:bg-accent-pink selection:text-white">
                <div className="flex items-center gap-2">
                  <span className="bg-accent-green text-ink px-1.5 py-0.5 rounded text-[10px] font-bold">QUERY</span>
                  <span className="font-bold text-xs">"{msg.query}"</span>
                </div>
                <span className="opacity-50 text-[10px]">{msg.timestamp.toLocaleTimeString()}</span>
              </div>

              {/* Status / Answer Body */}
              <div className={`p-4 text-sm font-medium leading-relaxed bg-white selection:bg-accent-pink selection:text-white ${msg.status?.startsWith('REFUSED') ? 'text-accent-pink font-semibold' : 'text-ink'}`}>
                {msg.answer}
              </div>

              {/* Telemetry & Evidence Dashboard */}
              <div className="bg-[#F8F9FA] border-t-2 border-ink p-3 grid grid-cols-1 xl:grid-cols-3 gap-4 selection:bg-accent-pink selection:text-white">
                
                {/* Diagnostics Box */}
                <div className="xl:col-span-1 flex flex-col gap-2">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-accent-blue flex items-center gap-1 border-b border-ink/20 pb-1">
                    <Activity className="w-3 h-3 text-accent-blue" /> DIAGNOSTICS & PERFORMANCE
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                    <div className="bg-white p-1.5 border border-ink/50 rounded flex flex-col justify-between">
                      <span className="opacity-50 mb-0.5">STT ENGINE</span>
                      <span className="font-bold text-accent-pink">{msg.telemetry?.stt_provider || 'TEXT'}</span>
                    </div>
                    <div className="bg-white p-1.5 border border-ink/50 rounded flex flex-col justify-between">
                      <span className="opacity-50 mb-0.5">STT LATENCY</span>
                      <span className="font-bold">{msg.telemetry?.stt_duration_ms?.toFixed(1) || '0.0'}ms</span>
                    </div>
                    <div className="bg-white p-1.5 border border-ink/50 rounded flex flex-col justify-between">
                      <span className="opacity-50 mb-0.5">RETRIEVAL (RRF)</span>
                      <span className="font-bold">{msg.telemetry?.retrieval_duration_ms?.toFixed(1) || '0.0'}ms</span>
                    </div>
                    <div className="bg-white p-1.5 border border-ink/50 rounded flex flex-col justify-between">
                      <span className="opacity-50 mb-0.5">GENERATION</span>
                      <span className="font-bold text-accent-green">{msg.telemetry?.generation_duration_ms?.toFixed(1) || '0.0'}ms</span>
                    </div>
                    <div className="col-span-2 bg-ink text-white p-1.5 border border-ink rounded flex justify-between items-center selection:bg-accent-pink selection:text-white">
                      <span className="opacity-70 text-accent-pink">TOTAL END-TO-END</span>
                      <span className="font-bold text-xs text-accent-green">{msg.telemetry?.total_duration_ms?.toFixed(1) || '0.0'}ms</span>
                    </div>
                  </div>
                </div>

                {/* Evidence Box */}
                <div className="xl:col-span-2 flex flex-col gap-2">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-accent-green flex items-center gap-1 border-b border-ink/20 pb-1">
                    <FileText className="w-3 h-3 text-accent-green" /> Grounding Evidence
                  </div>
                  {msg.citations && msg.citations.length > 0 ? (
                    <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                      {msg.citations.map((cit, cidx) => (
                        <div key={cidx} className="bg-white p-2 border border-ink shadow-neo-hover rounded text-[11px] font-mono">
                          <div className="font-bold text-accent-blue mb-0.5 flex items-center gap-1.5">
                            <span className="bg-accent-blue text-white px-1.5 rounded text-[9px]">DOC</span> {cit.title || cit.document_name}
                          </div>
                          <div className="opacity-80 border-l-2 border-accent-blue/30 pl-1.5 ml-0.5 leading-relaxed line-clamp-2">
                            {cit.snippet || cit.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-ink border-dashed p-3 rounded text-center opacity-60 font-mono text-[10px]">
                      No distinct citations matched. Result from base guardrails.
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}

          {/* 6 Sample Question Cards (Persistent at Bottom) */}
          <div className="neo-container p-4 bg-[#F9FAFC] border-2 border-dashed border-ink/30 mt-2">
            <h4 className="font-bold text-xs mb-1 uppercase tracking-wider text-accent-blue flex items-center gap-1">
              <Mic className="w-3.5 h-3.5" /> Sample Benchmark Questions
            </h4>
            <p className="font-mono text-[10px] text-ink/70 mb-3">Click any sample card below to test the RAG engine instantly:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              <div 
                onClick={() => submitSampleQuery("What is the capital of Shivaji Maharaj")}
                className="bg-white p-2.5 border-2 border-ink rounded shadow-neo-hover cursor-pointer hover:bg-blue-50 text-left transition-colors"
              >
                <p className="font-bold text-[9px] text-accent-blue mb-0.5">HISTORY (CROSS-LINGUAL)</p>
                <p className="text-[11px] font-mono font-medium">What is the capital of Shivaji Maharaj?</p>
              </div>

              <div 
                onClick={() => submitSampleQuery("Neural networks kaise kaam karte hain in artificial intelligence?")}
                className="bg-white p-2.5 border-2 border-ink rounded shadow-neo-hover cursor-pointer hover:bg-pink-50 text-left transition-colors"
              >
                <p className="font-bold text-[9px] text-accent-pink mb-0.5">TECH (HINGLISH)</p>
                <p className="text-[11px] font-mono font-medium">Neural networks kaise kaam karte hain in artificial intelligence?</p>
              </div>

              <div 
                onClick={() => submitSampleQuery("Who discovered the double helix structure of DNA?")}
                className="bg-white p-2.5 border-2 border-ink rounded shadow-neo-hover cursor-pointer hover:bg-green-50 text-left transition-colors"
              >
                <p className="font-bold text-[9px] text-accent-green mb-0.5">SCIENCE (ENGLISH)</p>
                <p className="text-[11px] font-mono font-medium">Who discovered the double helix structure of DNA?</p>
              </div>

              <div 
                onClick={() => submitSampleQuery("When was Goa liberated from Portuguese rule?")}
                className="bg-white p-2.5 border-2 border-ink rounded shadow-neo-hover cursor-pointer hover:bg-purple-50 text-left transition-colors"
              >
                <p className="font-bold text-[9px] text-purple-600 mb-0.5">GOA HISTORY (ENGLISH)</p>
                <p className="text-[11px] font-mono font-medium">When was Goa liberated from Portuguese rule?</p>
              </div>

              <div 
                onClick={() => submitSampleQuery("When did the Indian Constitution come into effect?")}
                className="bg-white p-2.5 border-2 border-ink rounded shadow-neo-hover cursor-pointer hover:bg-teal-50 text-left transition-colors"
              >
                <p className="font-bold text-[9px] text-teal-600 mb-0.5">CIVICS (ENGLISH)</p>
                <p className="text-[11px] font-mono font-medium">When did the Indian Constitution come into effect?</p>
              </div>

              <div 
                onClick={() => submitSampleQuery("Give me a recipe for pizza")}
                className="bg-white p-2.5 border-2 border-ink rounded shadow-neo-hover cursor-pointer hover:bg-orange-50 text-left transition-colors"
              >
                <p className="font-bold text-[9px] text-accent-orange mb-0.5">OUT OF SCOPE (REFUSAL)</p>
                <p className="text-[11px] font-mono font-medium">Give me a recipe for pizza</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: Pipeline & Strategies */}
      <div className="w-full md:w-[280px] flex flex-col gap-2.5 shrink-0">
        
        {/* 8-Stage Pipeline */}
        <div className="neo-container p-3">
          <h2 className="text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2 border-b-2 border-ink pb-1.5">
            <Server className="w-3.5 h-3.5 text-accent-blue" /> System Pipeline
          </h2>
          
          <div className="flex flex-col gap-1 relative text-[10px] font-mono font-bold">
            {[
              "1. Voice Capture",
              "2. Speech-to-Text Processing",
              "3. Intent & Toxicity Guardrail",
              "4. Strategy & Context Routing",
              "5. Hybrid Vector Retrieval",
              "6. Reciprocal Rank Fusion",
              "7. Evidence Verification",
              "8. LLM Answer Generation"
            ].map((stage, i) => {
              const isActive = pipelineStage === i + 1;
              const isDone = pipelineStage > i + 1 || (pipelineStage === 0 && !isRecording && !isLoading);
              const isIdle = pipelineStage === 0;
              
              return (
                <div key={i} className="flex flex-col">
                  <div className={`p-1.5 rounded border-2 border-ink transition-all duration-200 flex items-center justify-between ${
                    isActive ? 'bg-accent-blue text-white shadow-neo translate-x-0.5' : 
                    isDone && !isIdle ? 'bg-accent-green text-white shadow-none' : 
                    'bg-white text-ink opacity-70 hover:bg-gray-50'
                  }`}>
                    <span>{stage}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                  </div>
                  {i < 7 && (
                    <div className="flex justify-center h-2">
                      <div className={`w-0.5 h-full ${isActive || isDone ? 'bg-ink' : 'bg-ink/20'}`}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 Chunking Strategies */}
        <div className="neo-container p-3 bg-[#F9F5FD]">
          <h2 className="text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2 border-b-2 border-ink pb-1.5">
            <Cpu className="w-3.5 h-3.5 text-accent-pink" /> 5 Chunking Strategies
          </h2>
          <div className="space-y-2 font-mono text-[9px] font-medium leading-tight">
            <div 
              className={`p-1.5 border border-ink shadow-neo-hover rounded cursor-pointer transition-colors ${activeTooltip === 's1' ? 'bg-pink-100' : 'bg-white hover:bg-pink-50'}`}
              onClick={() => setActiveTooltip(activeTooltip === 's1' ? null : 's1')}
            >
              <span className="font-bold text-accent-blue block mb-0.5">1. Parent-Child (Default)</span>
              350-token parent + 90-token child vectors.
              {activeTooltip === 's1' && <div className="mt-1 font-normal text-ink/80 pt-1 border-t border-ink/20">Balances speed with context depth. Retrieves child chunks, passes parent to LLM.</div>}
            </div>
            <div 
              className={`p-1.5 border border-ink rounded cursor-pointer transition-colors ${activeTooltip === 's2' ? 'bg-pink-100' : 'bg-white hover:bg-pink-50'}`}
              onClick={() => setActiveTooltip(activeTooltip === 's2' ? null : 's2')}
            >
              <span className="font-bold block mb-0.5">2. Semantic Boundaries</span>
              NLP sentence boundary splitting.
              {activeTooltip === 's2' && <div className="mt-1 font-normal text-ink/80 pt-1 border-t border-ink/20">Splits vectors where sentences naturally break using NLP logic.</div>}
            </div>
            <div 
              className={`p-1.5 border border-ink rounded cursor-pointer transition-colors ${activeTooltip === 's3' ? 'bg-pink-100' : 'bg-white hover:bg-pink-50'}`}
              onClick={() => setActiveTooltip(activeTooltip === 's3' ? null : 's3')}
            >
              <span className="font-bold block mb-0.5">3. Metadata-Aware</span>
              Injects lang tags, titles, and categories.
              {activeTooltip === 's3' && <div className="mt-1 font-normal text-ink/80 pt-1 border-t border-ink/20">Embeds categories & titles directly inside vector for accuracy.</div>}
            </div>
            <div 
              className={`p-1.5 border border-ink rounded cursor-pointer transition-colors ${activeTooltip === 's4' ? 'bg-pink-100' : 'bg-white hover:bg-pink-50'}`}
              onClick={() => setActiveTooltip(activeTooltip === 's4' ? null : 's4')}
            >
              <span className="font-bold block mb-0.5">4. Dynamic Overlap</span>
              40-word window + 25% overlap.
              {activeTooltip === 's4' && <div className="mt-1 font-normal text-ink/80 pt-1 border-t border-ink/20">Sliding window with 25% overlap so no context is lost at boundaries.</div>}
            </div>
            <div 
              className={`p-1.5 border border-ink rounded cursor-pointer transition-colors ${activeTooltip === 's5' ? 'bg-pink-100' : 'bg-white hover:bg-pink-50'}`}
              onClick={() => setActiveTooltip(activeTooltip === 's5' ? null : 's5')}
            >
              <span className="font-bold block mb-0.5">5. Canonical</span>
              Original raw passage boundaries.
              {activeTooltip === 's5' && <div className="mt-1 font-normal text-ink/80 pt-1 border-t border-ink/20">Uses original untouched dataset passages as provided.</div>}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
