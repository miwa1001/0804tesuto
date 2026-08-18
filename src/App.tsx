import { useState } from 'react';
import { HistoryItem } from './types';
import { GachaponFortune } from './components/GachaponFortune';
import { DecisionClinic } from './components/DecisionClinic';
import { GachaponHistory } from './components/GachaponHistory';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Toast } from './components/Toast';
import { Confetti } from './components/Confetti';
import { Volume2, VolumeX, Sparkles, Dices, History, Key, Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'fortune' | 'decision' | 'history'>('fortune');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  
  // 從本地儲存讀取使用者的 API Key
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
      // ignore
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full border border-[#3D348B] font-bold ${userApiKey ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {userApiKey ? '● 已授權' : '○ 未設定 Key'}
                </span>
              </h1>
              <p className="text-xs font-semibold text-purple-600/80">
                請輸入您的 Gemini API Key 以啟動 AI 扭蛋！
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`p-3 rounded-2xl border-2 border-[#3D348B] transition shadow-sm font-bold flex items-center gap-1.5 text-xs cursor-pointer ${
                userApiKey
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  : 'bg-[#FF94B9] text-white hover:opacity-90 animate-pulse'
              }`}
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">
                {userApiKey ? '金鑰設定' : '立即設定 Key'}
              </span>
            </button>

            <button
              onClick={toggleSound}
              className="p-3 rounded-2xl bg-white border-2 border-[#3D348B] text-[#3D348B] hover:bg-[#FFF0F5] transition shadow-sm font-bold flex items-center gap-1.5 text-xs cursor-pointer"
            >
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
                activeTab === tab
                  ? 'bg-white text-[#3D348B] shadow-sm border border-[#3D348B] font-black'
                  : 'hover:text-purple-900 font-bold'
              }`}
            >
              {tab === 'fortune' && <Sparkles className="w-4 h-4" />}
              {tab === 'decision' && <Dices className="w-4 h-4" />}
              {tab === 'history' && <History className="w-4 h-4" />}
              <span>{tab === 'fortune' ? '靈感扭蛋' : tab === 'decision' ? '選擇診所' : '扭蛋紀錄'}</span>
            </button>
          ))}
        </nav>

        {/* Main View Container */}
        <main className="flex-grow flex flex-col justify-center">
          {/* 如果沒有 Key 且不是在看歷史紀錄，顯示鎖定畫面 */}
          {!userApiKey && activeTab !== 'history' ? (
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[40px] border-4 border-dashed border-[#3D348B] flex flex-col items-center text-center gap-6 shadow-xl">
              <div className="w-20 h-20 bg-[#FF94B9] rounded-3xl flex items-center justify-center border-4 border-[#3D348B] rotate-6 shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-2">扭蛋機尚未啟動</h2>
                <p className="text-sm font-bold text-gray-500 leading-relaxed">
                  本工具使用您的個人金鑰進行 AI 運算。<br/>
                  請先完成 API Key 設定，即可開始獲取每日靈感！
                </p>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="px-8 py-4 bg-[#FF94B9] text-white rounded-2xl font-black border-2 border-[#3D348B] shadow-[4px_4px_0px_0px_rgba(61,52,139,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                前往設定 API Key
              </button>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Safe · Private · Powered by Gemini
              </p>
            </div>
          ) : (
            <>
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
                  userApiKey={userApiKey}
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
            </>
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
