import { HistoryItem } from '../types';
import { Trash2, History } from 'lucide-react';

interface GachaponHistoryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

export function GachaponHistory({ history, onClearHistory }: GachaponHistoryProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#3D348B] pop-shadow space-y-4">
      <div className="flex justify-between items-center border-b-2 border-purple-100 pb-3">
        <div>
          <h2 className="text-lg font-black text-[#3D348B] flex items-center gap-2">
            <History className="w-5 h-5 text-[#3D348B]" />
            <span>扭蛋紀錄歷程</span>
          </h2>
          <p className="text-xs font-semibold text-purple-600">
            紀錄您最近獲得的靈感膠囊與決策結果
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-purple-400 font-bold hover:text-rose-500 transition flex items-center space-x-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空紀錄</span>
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {history.length === 0 ? (
          <p className="text-center text-purple-400 font-semibold text-xs py-8">
            尚無扭蛋紀錄喔！去扭一顆靈感膠囊吧 ✨
          </p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-purple-50/80 border-2 border-[#3D348B] rounded-2xl flex justify-between items-center text-xs font-bold"
            >
              <div className="space-y-0.5">
                <span className="font-black text-[#3D348B] px-2 py-0.5 bg-yellow-200 rounded-lg border border-[#3D348B]">
                  {item.category}
                </span>
                <div className="text-purple-900 pt-1.5">{item.result}</div>
              </div>
              <span className="text-purple-400 font-bold shrink-0 ml-2">
                {item.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
