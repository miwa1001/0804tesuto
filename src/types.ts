export interface FortuneScores {
  energy: number;
  creativity: number;
  chill: number;
}

export interface FortuneResult {
  type: string;
  colorClass: string;
  title: string;
  explain: string;
  dos: string;
  donts: string;
  luckyColor: string;
  luckyNum: string;
  scores: FortuneScores;
}

export interface HistoryItem {
  id: string;
  category: string;
  result: string;
  time: string;
}

export type PresetKey = 'eat' | 'drink' | 'action' | 'weekend';
