import { useState, KeyboardEvent } from 'react';
import { PresetKey } from '../types';
import { playPopSound, playWinSound } from '../utils/audio';
import { Dices, Plus, Trash2, X } from 'lucide-react';

interface DecisionClinicProps {
  soundEnabled: boolean;
  showToast: (msg: string) => void;
  triggerConfetti: () => void;
  onSaveHistory: (category: string, result: string) => void;
}

const PRESETS: Record<PresetKey, string[]> = {
  eat: ['🍔 麥當勞', '🍜 濃郁拉麵', '🍱 爽口健康餐盒', '🍕 義式披薩', '🍲 暖心火鍋', '🍱 台式便當', '🌮 韓式炸雞'],
  drink: ['🧋 珍珠奶茶', '☕ 冰美式咖啡', '🍋 鮮檸檬綠茶', '🥤 氣泡水', '🥭 芒果冰沙', '🍵 拿鐵抹茶'],
  action: ['✨ 立刻開始做！', '🛋️ 先休息 15 分鐘再說', '🗓️ 排到明天日程', '💬 找朋友聊聊聽意見', '🙈 果斷先放著！'],
  weekend: ['🎬 在家看影集放空', '🌳 去戶外公園曬太陽', '☕ 找間咖啡廳看書', '🛍️ 去商場隨意逛街', '🚗 安排兩天一夜小旅行'],
};

export function DecisionClinic({
  soundEnabled,
  showToast,
  triggerConfetti,
  onSaveHistory,
}: DecisionClinicProps) {
  const [options, setOptions] = useState<string[]>([...PRESETS.eat]);
  const [inputValue, setInputValue] = useState('');
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const loadPreset = (key: PresetKey) => {
    setOptions([...PRESETS[key]]);
    setWinner(null);
    showToast('已載入預設決策選項 🎯');
  };

  const handleAddOption = () => {
    const val = inputValue.trim();
    if (val) {
      if (options.includes(val)) {
        showToast('該選項已存在囉！');
        return;
      }
      setOptions([...options, val]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddOption();
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setOptions([]);
    setWinner(null);
  };

  const rollDecision = () => {
    if (options.length === 0) {
      showToast('請先輸入至少一個選項喔！⚠️');
      return;
    }

    setRolling(true);
    setWinner(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomChoice = options[Math.floor(Math.random() * options.length)];
      setWinner(randomChoice);
      playPopSound(soundEnabled);
      counter++;

      if (counter > 14) {
        clearInterval(interval);
        const finalWinner = options[Math.floor(Math.random() * options.length)];
        setWinner(finalWinner);
        setRolling(false);

        playWinSound(soundEnabled);
        triggerConfetti();

        onSaveHistory('選擇困難診所', `選項[${options.length}個] ➜ 扭出：${finalWinner}`);
      }
    }, 80);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#3D348B] pop-shadow space-y-5">
      <div className="border-b-2 border-purple-100 pb-3">
        <h2 className="text-lg font-black text-[#3D348B] flex items-center gap-2">
          <span>🎯</span> 選擇困難診所
        </h2>
        <p className="text-xs font-semibold text-purple-600">
          別再猶豫不決！把選項丟進來，交給命運扭蛋！
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-black text-purple-400 uppercase tracking-wider">
          快捷情境預設
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadPreset('eat')}
            className="text-xs bg-amber-100 text-amber-900 border-2 border-[#3D348B] px-3 py-1.5 rounded-xl font-bold hover:bg-amber-200 transition cursor-pointer"
          >
            🍔 今天吃什麼？
          </button>
          <button
            onClick={() => loadPreset('drink')}
            className="text-xs bg-pink-100 text-pink-900 border-2 border-[#3D348B] px-3 py-1.5 rounded-xl font-bold hover:bg-pink-200 transition cursor-pointer"
          >
            🧋 飲料喝哪家？
          </button>
          <button
            onClick={() => loadPreset('action')}
            className="text-xs bg-sky-100 text-sky-900 border-2 border-[#3D348B] px-3 py-1.5 rounded-xl font-bold hover:bg-sky-200 transition cursor-pointer"
          >
            🤔 做還是不做？
          </button>
          <button
            onClick={() => loadPreset('weekend')}
            className="text-xs bg-emerald-100 text-emerald-900 border-2 border-[#3D348B] px-3 py-1.5 rounded-xl font-bold hover:bg-emerald-200 transition cursor-pointer"
          >
            🚗 週末放鬆提案
          </button>
        </div>
      </div>

      {/* Add option input */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label htmlFor="optionInput" className="text-xs font-black text-[#3D348B]">
            新增選項 (按 Enter 或點擊新增)
          </label>
          {options.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-rose-500 font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>清空選項</span>
            </button>
          )}
        </div>
        <div className="flex space-x-2">
          <input
            id="optionInput"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="例如：韓式炸雞、拉麵、便當..."
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#3D348B] focus:outline-none focus:bg-purple-50 text-sm font-bold text-[#3D348B] placeholder-purple-300"
          />
          <button
            onClick={handleAddOption}
            className="px-5 py-2.5 bg-[#B39DDB] text-white text-sm font-black rounded-xl border-2 border-[#3D348B] hover:bg-purple-500 transition shadow-sm flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>新增</span>
          </button>
        </div>
      </div>

      {/* Option Tags */}
      <div className="flex flex-wrap gap-2 min-h-[55px] p-3 bg-purple-50/60 rounded-2xl border-2 border-[#3D348B] items-center">
        {options.length === 0 ? (
          <span className="text-purple-400 text-xs font-semibold italic">
            尚未新增任何選項，請在上方輸入...
          </span>
        ) : (
          options.map((opt, idx) => (
            <span
              key={idx}
              className="inline-flex items-center bg-white border-2 border-[#3D348B] text-[#3D348B] text-xs font-black px-3 py-1.5 rounded-xl shadow-sm"
            >
              {opt}
              <button
                onClick={() => removeOption(idx)}
                className="ml-2 text-purple-400 hover:text-rose-500 font-black cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Roll Decision Button */}
      <button
        onClick={rollDecision}
        disabled={rolling}
        className={`w-full py-3.5 bg-[#80CBC4] text-[#3D348B] font-black text-base rounded-2xl border-3 border-[#3D348B] pop-shadow hover:bg-teal-300 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center space-x-2 cursor-pointer ${
          rolling ? 'opacity-75 cursor-wait' : ''
        }`}
      >
        <Dices className="w-5 h-5" />
        <span>{rolling ? '扭扭扭... 運算中！' : '扭蛋！幫我做決定！'}</span>
      </button>

      {/* Result Panel */}
      {winner && (
        <div className="p-6 bg-gradient-to-br from-yellow-100 to-pink-100 border-3 border-[#3D348B] rounded-2xl text-center space-y-3 animate-capsule pop-shadow">
          <div className="text-xs font-black text-purple-700 uppercase tracking-widest">
            Gacha Result
          </div>
          <div className="text-purple-900 text-sm font-bold">
            宇宙為你選出的最佳答案是：
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#FF94B9] py-2 px-6 inline-block rounded-2xl bg-white border-2 border-[#3D348B] shadow-sm transform rotate-1">
            {winner}
          </div>
          {!rolling && (
            <div>
              <button
                onClick={rollDecision}
                className="text-xs text-purple-700 hover:text-[#3D348B] underline font-extrabold cursor-pointer"
              >
                不滿意？再扭一次！
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
