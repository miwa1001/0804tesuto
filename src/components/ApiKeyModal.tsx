import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, Trash2, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  showToast: (msg: string) => void;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  showToast,
}: ApiKeyModalProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = inputKey.trim();
    onSaveApiKey(trimmed);
    if (trimmed) {
      showToast('🔑 已成功儲存自訂 API Key！');
    } else {
      showToast('已恢復使用預設 API Key / 備用模式');
    }
    onClose();
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
    showToast('已清除自訂 API Key 🗑️');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 border-3 border-[#3D348B] pop-shadow relative space-y-4"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-purple-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 border-2 border-[#3D348B] flex items-center justify-center">
                  <Key className="w-4 h-4 text-[#3D348B]" />
                </div>
                <h3 className="font-black text-lg text-[#3D348B]">
                  設定 Gemini API Key
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-purple-400 hover:text-rose-500 font-bold transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-purple-700 font-semibold leading-relaxed">
              您可以填入自己的 Google Gemini API Key 來生成專屬扭蛋運勢。Key
              將安全地儲存於您的瀏覽器本機中。
            </p>

            {/* Input field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#3D348B] flex justify-between">
                <span>Gemini API Key</span>
                {apiKey ? (
                  <span className="text-emerald-600 font-bold">● 已設定自訂 Key</span>
                ) : (
                  <span className="text-purple-400 font-normal">未設定（使用系統預設）</span>
                )}
              </label>

              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border-2 border-[#3D348B] text-xs font-mono text-[#3D348B] focus:outline-none focus:bg-purple-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-purple-400 hover:text-[#3D348B] cursor-pointer"
                  title={showPassword ? '隱藏' : '顯示'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Helper link */}
            <div className="text-[11px] text-purple-500 font-semibold flex items-center justify-between pt-1">
              <span>還沒有 API Key？免費申請：</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-pink-600 hover:underline font-bold flex items-center gap-0.5"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-xl border-2 border-[#3D348B] hover:bg-rose-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清除</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 text-[#3D348B] text-xs font-bold rounded-xl border-2 border-[#3D348B] hover:bg-gray-200 transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 bg-[#FF94B9] text-white text-xs font-black rounded-xl border-2 border-[#3D348B] hover:bg-pink-400 transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>儲存設定</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
