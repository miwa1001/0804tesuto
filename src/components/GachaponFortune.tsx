import { useState } from 'react';
import { FortuneResult } from '../types';
import { playPopSound, playWinSound } from '../utils/audio';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';

interface GachaponFortuneProps {
  soundEnabled: boolean;
  userApiKey: string;
  showToast: (msg: string) => void;
  triggerConfetti: () => void;
  onSaveHistory: (category: string, result: string) => void;
}

export function GachaponFortune({
  soundEnabled,
  userApiKey,
  showToast,
  triggerConfetti,
  onSaveHistory,
}: GachaponFortuneProps) {
  const [state, setState] = useState<'idle' | 'drawing' | 'result'>('idle');
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [copied, setCopied] = useState(false);

  const startDraw = async () => {
    if (state === 'drawing') return;

    setState('drawing');
    playPopSound(soundEnabled);

    const timer = setInterval(() => {
      playPopSound(soundEnabled);
    }, 250);

    try {
      const res = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: userApiKey }),
      });

      if (!res.ok) {
        throw new Error('Network error');
      }

      const data: FortuneResult = await res.json();
      clearInterval(timer);

      setFortune(data);
      setState('result');
      playWinSound(soundEnabled);
      triggerConfetti();

      onSaveHistory('AI 雲端靈籤', `${data.type} - ${data.title}`);
    } catch {
      clearInterval(timer);
      setState('idle');
      showToast('⚠️ AI 伺服器連線異常，請稍後再試一次！');
    }
  };

  const copyResult = () => {
    if (!fortune) return;
    const text = `【日常靈感扭蛋機】\n今日運勢：${fortune.type}\n靈感語錄：${fortune.title}\n宜：${fortune.dos}\n忌：${fortune.donts}\n祝你有個超棒的一天！✨`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast('已複製靈籤結果至剪貼簿！📋');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      showToast('複製失敗，請手動複製');
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#3D348B] pop-shadow text-center relative overflow-hidden transition-all duration-300">
      {/* 1. Idle State */}
      {state === 'idle' && (
        <div className="py-4 flex flex-col items-center">
          <div
            onClick={startDraw}
            className="relative w-48 h-64 my-2 flex flex-col items-center group cursor-pointer"
            title="點擊扭蛋機轉動"
          >
            {/* Glass dome */}
            <div className="w-44 h-40 bg-sky-100/80 rounded-t-full border-3 border-[#3D348B] relative overflow-hidden flex items-end justify-center pb-2 shadow-inner">
              <div className="relative w-36 h-28 flex flex-wrap justify-center items-end gap-1">
                <div className="w-8 h-8 rounded-full bg-[#FF94B9] border-2 border-[#3D348B] shadow-sm transform group-hover:scale-110 transition-transform"></div>
                <div className="w-8 h-8 rounded-full bg-[#FFD966] border-2 border-[#3D348B] shadow-sm transform group-hover:scale-110 transition-transform"></div>
                <div className="w-8 h-8 rounded-full bg-[#80CBC4] border-2 border-[#3D348B] shadow-sm transform group-hover:scale-110 transition-transform"></div>
                <div className="w-8 h-8 rounded-full bg-[#B39DDB] border-2 border-[#3D348B] shadow-sm transform group-hover:scale-110 transition-transform"></div>
                <div className="w-8 h-8 rounded-full bg-[#90CAF9] border-2 border-[#3D348B] shadow-sm transform group-hover:scale-110 transition-transform"></div>
                <div className="w-8 h-8 rounded-full bg-pink-300 border-2 border-[#3D348B] shadow-sm transform group-hover:scale-110 transition-transform"></div>
              </div>
              {/* Highlight refraction */}
              <div className="absolute top-3 left-5 w-8 h-12 bg-white/50 rounded-full transform -rotate-45 pointer-events-none"></div>
            </div>

            {/* Base */}
            <div className="w-48 h-24 bg-[#FF94B9] rounded-b-3xl border-3 border-[#3D348B] flex flex-col items-center justify-between p-2 relative shadow-md">
              <div className="w-12 h-12 rounded-full bg-[#FFD966] border-2 border-[#3D348B] flex items-center justify-center font-black text-[#3D348B] shadow transition-transform group-hover:scale-110 group-hover:rotate-45">
                <div className="w-8 h-2 bg-[#3D348B] rounded-full"></div>
              </div>
              <div className="w-16 h-7 bg-purple-900/30 rounded-t-lg border-2 border-[#3D348B]"></div>
            </div>
          </div>

          <p className="text-purple-900 font-bold mt-2 text-base">
            轉一轉旋鈕，扭出今日幸運靈感膠囊！
          </p>

          <button
            onClick={startDraw}
            className="mt-4 px-8 py-3.5 bg-[#FFD966] text-[#3D348B] font-extrabold text-lg rounded-2xl border-3 border-[#3D348B] pop-shadow hover:bg-yellow-300 hover:scale-105 active:scale-95 transition flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-[#3D348B]" />
            <span>扭一下，轉出今日運勢</span>
          </button>
        </div>
      )}

      {/* 2. Drawing State */}
      {state === 'drawing' && (
        <div className="py-12 flex flex-col items-center">
          <div className="w-48 h-64 relative flex flex-col items-center animate-machine-shake">
            <div className="w-44 h-40 bg-sky-100 rounded-t-full border-3 border-[#3D348B] relative overflow-hidden flex items-end justify-center pb-2">
              <div className="relative w-36 h-28 flex flex-wrap justify-center items-end gap-1 animate-bounce">
                <div className="w-8 h-8 rounded-full bg-[#FF94B9] border-2 border-[#3D348B]"></div>
                <div className="w-8 h-8 rounded-full bg-[#FFD966] border-2 border-[#3D348B]"></div>
                <div className="w-8 h-8 rounded-full bg-[#80CBC4] border-2 border-[#3D348B]"></div>
              </div>
            </div>
            <div className="w-48 h-24 bg-[#FF94B9] rounded-b-3xl border-3 border-[#3D348B] flex flex-col items-center justify-between p-2">
              <div className="w-12 h-12 rounded-full bg-[#FFD966] border-2 border-[#3D348B] flex items-center justify-center animate-spin-knob">
                <div className="w-8 h-2 bg-[#3D348B] rounded-full"></div>
              </div>
              <div className="w-16 h-7 bg-purple-900/30 rounded-t-lg border-2 border-[#3D348B]"></div>
            </div>
          </div>
          <p className="text-[#3D348B] font-extrabold text-lg mt-6 tracking-wide animate-pulse">
            📡 正在連線 AI 雲端伺服器運算中...
          </p>
        </div>
      )}

      {/* 3. Result State */}
      {state === 'result' && fortune && (
        <div className="space-y-5 text-left transition-all animate-capsule">
          <div className="flex justify-between items-center border-b-2 border-purple-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💊</span>
              <h2 className="text-[#3D348B] text-lg font-black">
                今日靈感膠囊解鎖
              </h2>
            </div>
            <span
              className={`px-4 py-1.5 rounded-2xl font-black text-base border-2 border-[#3D348B] shadow-sm ${
                fortune.colorClass || 'bg-purple-200 text-purple-950'
              }`}
            >
              {fortune.type}
            </span>
          </div>

          {/* Indicators */}
          <div className="grid grid-cols-3 gap-2 bg-purple-100/60 p-3 rounded-2xl border-2 border-[#3D348B] text-xs text-center font-extrabold">
            <div>
              <span className="text-purple-500 block text-[10px]">
                ⚡ 活力能量
              </span>
              <span className="text-amber-600 text-base font-black">
                {fortune.scores.energy}%
              </span>
            </div>
            <div>
              <span className="text-purple-500 block text-[10px]">
                💡 靈感指數
              </span>
              <span className="text-pink-600 text-base font-black">
                {fortune.scores.creativity}%
              </span>
            </div>
            <div>
              <span className="text-purple-500 block text-[10px]">
                🛋️ 療癒指數
              </span>
              <span className="text-teal-600 text-base font-black">
                {fortune.scores.chill}%
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className="bg-purple-50/80 p-5 rounded-2xl border-2 border-[#3D348B] space-y-3 relative">
            <div className="text-[#3D348B] text-xl font-black text-center py-1">
              {fortune.title}
            </div>
            <div className="text-purple-900 text-sm font-semibold leading-relaxed border-t-2 border-purple-200/60 pt-3">
              {fortune.explain}
            </div>
          </div>

          {/* Dos / Donts */}
          <div className="grid grid-cols-2 gap-3 font-bold text-xs sm:text-sm">
            <div className="bg-emerald-100/80 border-2 border-[#3D348B] p-3 rounded-2xl flex items-start space-x-2">
              <span className="bg-emerald-400 text-[#3D348B] px-2 py-0.5 rounded-lg border border-[#3D348B] font-black shrink-0">
                宜
              </span>
              <span className="text-emerald-950 font-bold leading-snug">
                {fortune.dos}
              </span>
            </div>
            <div className="bg-rose-100/80 border-2 border-[#3D348B] p-3 rounded-2xl flex items-start space-x-2">
              <span className="bg-rose-400 text-[#3D348B] px-2 py-0.5 rounded-lg border border-[#3D348B] font-black shrink-0">
                忌
              </span>
              <span className="text-rose-950 font-bold leading-snug">
                {fortune.donts}
              </span>
            </div>
          </div>

          {/* Lucky Color & Number */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-bold">
            <div className="bg-amber-100/80 border-2 border-[#3D348B] p-3 rounded-2xl flex justify-between items-center">
              <span className="text-amber-900">幸運色</span>
              <span className="font-extrabold text-[#3D348B]">
                {fortune.luckyColor}
              </span>
            </div>
            <div className="bg-sky-100/80 border-2 border-[#3D348B] p-3 rounded-2xl flex justify-between items-center">
              <span className="text-sky-900">幸運數字</span>
              <span className="font-extrabold text-[#3D348B]">
                {fortune.luckyNum}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={startDraw}
              className="flex-1 py-3 bg-purple-100 text-[#3D348B] font-extrabold rounded-2xl border-2 border-[#3D348B] hover:bg-purple-200 transition text-sm flex items-center justify-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>再扭一顆</span>
            </button>
            <button
              onClick={copyResult}
              className="flex-1 py-3 bg-[#FF94B9] text-white font-extrabold rounded-2xl border-2 border-[#3D348B] hover:bg-pink-400 transition text-sm shadow-md flex items-center justify-center space-x-1 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '已複製！' : '複製靈籤結果 📋'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
