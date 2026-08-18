import { useState } from 'react';
import { HistoryItem } from './types';
import { GachaponFortune } from './components/GachaponFortune';
import { DecisionClinic } from './components/DecisionClinic';
import { GachaponHistory } from './components/GachaponHistory';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Toast } from './components/Toast';
import { Confetti } from './components/Confetti';
import { Volume2, VolumeX, Sparkles, Dices, History, Key, Lock, Sparkle } from 'lucide-react';

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
        showToast('API Key 已更新 🔑');
      } else {
        localStorage.removeItem('gemini_custom_api_key');
        showToast('已移除 API Key 🔒');
      }
    } catch { /* ignore */ }
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
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newItem: HistoryItem = { id: Date.now().toString(), category, result, time };
    const updated = [newItem, ...history].slice(0, 20);
    setHistory(updated);
    try { localStorage.setItem('gacha_history', JSON.stringify(updated)); } catch { }
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
              </h1>
              <p className="text-xs font-semibold text-purple-600/80">
                {userApiKey ? '✨ AI 模式已啟動' : '🔒 設定 Key 以開啟 AI 功能'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`p-3 rounded-2xl border-2 border-[#3D348B] transition shadow-sm font-bold flex items-center gap-1.5 text-xs cursor-pointer ${
                userApiKey ? 'bg-amber-100 text-amber-900' : 'bg-white text-gray-400'
              }`}
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">{userApiKey ? '金鑰已設定' : '設定 Key'}</span>
            </button>

            <button onClick={toggleSound} className="p-3 rounded-2xl bg-white border-2 border-[#3D348B] text-[#3D348B] shadow-sm">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex rounded-2xl bg-purple-200/60 p-1.5 mb-6 text-sm font-bold text-[#3D348B] border-2 border-[#3D348B] shadow-sm">
          {(['fortune', 'decision', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl transition-all duration-200 text-center flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === tab ? 'bg-white shadow-sm border border-[#3D348B] font-black' : 'hover:text-purple-900 font-bold'
              }`}
            >
              {tab === 'fortune' && <Sparkles className="w-4 h-4 text-purple-700" />}
              {tab === 'decision' && <Dices className="w-4 h-4 text-purple-700" />}
              {tab === 'history' && <History className="w-4 h-4 text-purple-700" />}
              <span>{tab === 'fortune' ? '靈感扭蛋' : tab === 'decision' ? '選擇診所' : '紀錄'}</span>
            </button>
          ))}
        </nav>

        {/* Main View Container */}
        <main className="flex-grow flex flex-col justify-center">
          
          {/* 1. 只有「靈感扭蛋」需要檢查 Key */}
          {activeTab === 'fortune' && (
            !userApiKey ? (
              <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[40px] border-4 border-dashed border-[#3D348B] flex flex-col items-center text-center gap-6 shadow-xl">
                <div className="w-20 h-20 bg-[#FF94B9] rounded-3xl flex items-center justify-center border-4 border-[#3D348B] rotate-6 shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-2">AI 扭蛋需要金鑰</h2>
                  <p className="text-sm font-bold text-gray-500">
                    「靈感扭蛋」功能由 Google Gemini 驅動，<br/>
                    請設定您的 API Key 即可開啟即時靈感生成！
                  </p>
                </div>
                <button
                  onClick={() => setIsKeyModalOpen(true)}
                  className="px-8 py-4 bg-[#FF94B9] text-white rounded-2xl font-black border-2 border-[#3D348B] shadow-[4px_4px_0px_0px_rgba(61,52,139,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  前往設定 API Key
                </button>
              </div>
            ) : (
              <GachaponFortune
                soundEnabled={soundEnabled}
                userApiKey={userApiKey}
                showToast={showToast}
                triggerConfetti={triggerConfetti}
                onSaveHistory={handleSaveHistory}
              />
            )
          )}

          {/* 2. 「選擇診所」不需要 Key，直接顯示 */}
          {activeTab === 'decision' && (
            <DecisionClinic
              soundEnabled={soundEnabled}
              showToast={showToast}
              triggerConfetti={triggerConfetti}
              onSaveHistory={handleSaveHistory}
            />
          )}

          {/* 3. 「扭蛋紀錄」不需要 Key，直接顯示 */}
          {activeTab === 'history' && (
            <GachaponHistory
              history={history}
              onClearHistory={handleClearHistory}
            />
          )}
        </main>

        <footer className="mt-8 text-center text-xs font-semibold text-purple-400 py-3">
          <p>🎈 每日輕鬆一下 · 快樂由你自己決定 🎈</p>
        </footer>
      </div>

      <Toast message={toastMessage} />
      <Confetti trigger={confettiTrigger} onComplete={() => setConfettiTrigger(false)} />
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
