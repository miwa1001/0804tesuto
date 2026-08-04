import { useState } from 'react';
import { HistoryItem } from './types';
import { GachaponFortune } from './components/GachaponFortune';
import { DecisionClinic } from './components/DecisionClinic';
import { GachaponHistory } from './components/GachaponHistory';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Toast } from './components/Toast';
import { Confetti } from './components/Confetti';
import { Volume2, VolumeX, Sparkles, Dices, History, Key } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'fortune' | 'decision' | 'history'>('fortune');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('gemini_custom_api_key') || '';
    } catch {
      return '';
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('gacha_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    try {
      if (key) {
        localStorage.setItem('gemini_custom_api_key', key);
      } else {
        localStorage.removeItem('gemini_custom_api_key');
      }
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  const triggerConfetti = () => {
    setConfettiTrigger(true);
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    showToast(nextState ? '音效已開啟 🎵' : '音效已靜音 🔇');
  };

  const handleSaveHistory = (category: string, result: string) => {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      category,
      result,
      time,
    };
    const updated = [newItem, ...history].slice(0, 20);
    setHistory(updated);
    try {
      localStorage.setItem('gacha_history', JSON.stringify(updated));
    } catch {
      // ignore quota limits if any
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('gacha_history');
    showToast('歷史紀錄已清空 ✨');
  };

  return (
    <div className="min-h-screen text-[#3D348B] flex flex-col justify-between p-3 sm:p-6 relative overflow-x-hidden selection:bg-[#FF94B9] selection:text-white">
      <div className="max-w-2xl mx-auto w-full flex-grow flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 pt-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF94B9] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-[#3D348B] transform -rotate-3 select-none">
              🎰
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-wide text-[#3D348B] flex items-center gap-2">
                日常靈感扭蛋機
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FF94B9] text-white border border-[#3D348B] font-bold">
                  {userApiKey ? '🔑 自訂 Key 模式' : '☁️ AI 雲端連線版'}
                </span>
              </h1>
              <p className="text-xs font-semibold text-purple-600/80">
                拯救選擇困難 · 每日 AI 即時靈感生成！
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* API Key Toggle Button */}
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`p-3 rounded-2xl border-2 border-[#3D348B] transition shadow-sm font-bold flex items-center gap-1.5 text-xs cursor-pointer ${
                userApiKey
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  : 'bg-white text-[#3D348B] hover:bg-[#FFF0F5]'
              }`}
              title="設定自訂 Gemini API Key"
            >
              <Key className="w-4 h-4 text-[#3D348B]" />
              <span className="hidden sm:inline">
                {userApiKey ? '自訂 Key 已設定' : 'API Key 設定'}
              </span>
            </button>

            {/* Sound Toggle Button */}
            <button
              onClick={toggleSound}
              className="p-3 rounded-2xl bg-white border-2 border-[#3D348B] text-[#3D348B] hover:bg-[#FFF0F5] transition shadow-sm font-bold flex items-center gap-1.5 text-xs cursor-pointer"
              title="切換音效"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-purple-700" />
                  <span className="hidden sm:inline">音效開</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-gray-400" />
                  <span className="hidden sm:inline">音效關</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex rounded-2xl bg-purple-200/60 p-1.5 mb-6 text-sm font-bold text-[#3D348B] border-2 border-[#3D348B] shadow-sm">
          <button
            onClick={() => setActiveTab('fortune')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-200 text-center flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'fortune'
                ? 'bg-white text-[#3D348B] shadow-sm border border-[#3D348B] font-black'
                : 'hover:text-purple-900 font-bold'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span>靈感運勢扭蛋</span>
          </button>

          <button
            onClick={() => setActiveTab('decision')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-200 text-center flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'decision'
                ? 'bg-white text-[#3D348B] shadow-sm border border-[#3D348B] font-black'
                : 'hover:text-purple-900 font-bold'
            }`}
          >
            <Dices className="w-4 h-4 text-purple-700" />
            <span>選擇困難診所</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-200 text-center flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-[#3D348B] shadow-sm border border-[#3D348B] font-black'
                : 'hover:text-purple-900 font-bold'
            }`}
          >
            <History className="w-4 h-4 text-purple-700" />
            <span>扭蛋紀錄</span>
          </button>
        </nav>

        {/* Main View Container */}
        <main className="flex-grow flex flex-col justify-center">
          {activeTab === 'fortune' && (
            <GachaponFortune
              soundEnabled={soundEnabled}
              userApiKey={userApiKey}
              showToast={showToast}
              triggerConfetti={triggerConfetti}
              onSaveHistory={handleSaveHistory}
            />
          )}

          {activeTab === 'decision' && (
            <DecisionClinic
              soundEnabled={soundEnabled}
              showToast={showToast}
              triggerConfetti={triggerConfetti}
              onSaveHistory={handleSaveHistory}
            />
          )}

          {activeTab === 'history' && (
            <GachaponHistory
              history={history}
              onClearHistory={handleClearHistory}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs font-semibold text-purple-400 py-3">
          <p>🎈 每日輕鬆一下 · 快樂由你自己決定 🎈</p>
        </footer>
      </div>

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />

      {/* Confetti canvas animation */}
      <Confetti
        trigger={confettiTrigger}
        onComplete={() => setConfettiTrigger(false)}
      />

      {/* Gemini API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={userApiKey}
        onSaveApiKey={handleSaveApiKey}
        showToast={showToast}
      />
    </div>
  );
}
