import { useState } from 'react';
import { HistoryItem } from './types';
import { GachaponFortune } from './components/GachaponFortune';
import { DecisionClinic } from './components/DecisionClinic';
import { GachaponHistory } from './components/GachaponHistory';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Toast } from './components/Toast';
import { Confetti } from './components/Confetti';
import { Volume2, VolumeX, Sparkles, Dices, History, Key, Lock, AlertCircle } from 'lucide-react';

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
        showToast('占卜金鑰已授權 🔑');
      } else {
        localStorage.removeItem('gemini_custom_api_key');
        showToast('金鑰已移除，功能已鎖定 🔒');
      }
    } catch { /* ignore */ }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  const triggerConfetti = () => setConfettiTrigger(true);

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
    showToast('紀錄已清空 ✨');
  };

  return (
    <div className="min-h-screen text-[#3D348B] flex flex-col justify-between p-3 sm:p-6 relative overflow-x-hidden selection:bg-[#FF94B9] selection:text-white bg-[#FDF0F5]">
      <div className="max-w-2xl mx-auto w-full flex-grow flex flex-col">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6 pt-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF94B9] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-[#3D348B] transform -rotate-3 select-none">
              🔮
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-wide text-[#3D348B] flex items-center gap-2">
                日常占卜扭蛋機
              </h1>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border border-[#3D348B] font-bold ${userApiKey ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {userApiKey ? '● AI 授權正常' : '○ 尚未設定金鑰'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`p-3 rounded-2xl border-2 border-[#3D348B] transition shadow-sm font-bold flex items-center gap-1.5 text-xs cursor-pointer ${
                userApiKey ? 'bg-indigo-100 text-indigo-900' : 'bg-[#FF94B9] text-white animate-pulse'
              }`}
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">{userApiKey ? '金鑰設定' : '立即填入 Key'}</span>
            </button>

            <button onClick={toggleSound} className="p-3 rounded-2xl bg-white border-2 border-[#3D348B] text-[#3D348B] shadow-sm">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-700" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex rounded-2xl bg-white/60 p-1.5 mb-6 text-sm font-bold text-[#3D348B] border-2 border-[#3D348B] shadow-sm">
          {(['fortune', 'decision', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl transition-all duration-200 text-center flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === tab ? 'bg-[#3D348B] text-white shadow-md font-black' : 'hover:text-purple-900 font-bold'
              }`}
            >
              {tab === 'fortune' && <Sparkles className="w-4 h-4" />}
              {tab === 'decision' && <Dices className="w-4 h-4" />}
              {tab === 'history' && <History className="w-4 h-4" />}
              <span>{tab === 'fortune' ? '每日占卜' : tab === 'decision' ? '選擇診所' : '占卜紀錄'}</span>
            </button>
          ))}
        </nav>

        {/* Main View Container */}
        <main className="flex-grow flex flex-col justify-center">
          
          {/* 強制檢查：若沒有 Key 且不是看紀錄，顯示鎖定畫面 */}
          {!userApiKey && activeTab !== 'history' ? (
            <div className="bg-white/90 backdrop-blur-md p-10 rounded-[40px] border-4 border-dashed border-[#3D348B] flex flex-col items-center text-center gap-6 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-[#FF94B9] rounded-3xl flex items-center justify-center border-4 border-[#3D348B] rotate-6 shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-2 text-[#3D348B]">占卜功能已鎖定</h2>
                <p className="text-sm font-bold text-gray-500 leading-relaxed">
                  本工具所有功能均由 AI 即時驅動。<br/>
                  為了維持運作，請點擊右上角設定您的 Gemini API Key。<br/>
                  填入後即可啟動占卜師進行預言。
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  onClick={() => setIsKeyModalOpen(true)}
                  className="w-full px-8 py-4 bg-[#FF94B9] text-white rounded-2xl font-black border-2 border-[#3D348B] shadow-[4px_4px_0px_0px_rgba(61,52,139,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  立即設定 API Key
                </button>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] font-bold text-indigo-500 underline flex items-center justify-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" /> 如何取得免費的 Google Key?
                </a>
              </div>
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

        <footer className="mt-8 text-center text-[10px] font-bold text-purple-300 py-3 uppercase tracking-widest">
          <p>🎈 Powered by AI · Controlled by You 🎈</p>
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
