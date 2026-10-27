import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowDown, 
  RotateCw, 
  RotateCcw, 
  ChevronsDown, 
  Layers 
} from 'lucide-react';

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onHardDrop: () => void;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onHold: () => void;
  disabled?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onHardDrop,
  onRotateCw,
  onRotateCcw,
  onHold,
  disabled = false,
}) => {
  const triggerHaptic = () => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(12);
      }
    } catch (e) {}
  };

  const handleAction = (callback: () => void) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    triggerHaptic();
    callback();
  };

  return (
    <div className="w-full select-none touch-manipulation pt-2 pb-1">
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        {/* Left cluster: Directional Pad */}
        <div className="flex flex-col items-center justify-center bg-slate-900/70 p-2.5 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-1.5 w-full max-w-[170px] items-center">
            {/* Top row */}
            <div />
            <button
              type="button"
              onPointerDown={handleAction(onRotateCw)}
              disabled={disabled}
              className="h-12 w-full rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 active:bg-cyan-600/60 active:scale-95 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs shadow-md transition-all"
              aria-label="회전"
            >
              <RotateCw className="w-5 h-5 text-cyan-400" />
            </button>
            <div />

            {/* Middle row */}
            <button
              type="button"
              onPointerDown={handleAction(onMoveLeft)}
              disabled={disabled}
              className="h-12 w-full rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 active:scale-95 border border-slate-700 text-slate-200 flex items-center justify-center shadow-md transition-all"
              aria-label="왼쪽 이동"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onPointerDown={handleAction(onMoveDown)}
              disabled={disabled}
              className="h-12 w-full rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 active:scale-95 border border-slate-700 text-slate-200 flex items-center justify-center shadow-md transition-all"
              aria-label="천천히 내리기"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              type="button"
              onPointerDown={handleAction(onMoveRight)}
              disabled={disabled}
              className="h-12 w-full rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 active:scale-95 border border-slate-700 text-slate-200 flex items-center justify-center shadow-md transition-all"
              aria-label="오른쪽 이동"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">이동 & 회전</span>
        </div>

        {/* Right cluster: Action Buttons */}
        <div className="flex flex-col items-center justify-between bg-slate-900/70 p-2.5 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-2 w-full h-full items-center">
            {/* Hold Button */}
            <button
              type="button"
              onPointerDown={handleAction(onHold)}
              disabled={disabled}
              className="h-14 rounded-xl bg-purple-950/70 hover:bg-purple-900/70 active:bg-purple-600/60 active:scale-95 border border-purple-500/40 text-purple-200 flex flex-col items-center justify-center shadow-md transition-all"
              aria-label="홀드"
            >
              <Layers className="w-5 h-5 text-purple-400 mb-0.5" />
              <span className="text-[10px] font-bold">HOLD</span>
            </button>

            {/* Reverse Rotate */}
            <button
              type="button"
              onPointerDown={handleAction(onRotateCcw)}
              disabled={disabled}
              className="h-14 rounded-xl bg-slate-800/70 hover:bg-slate-700/70 active:bg-slate-600/70 active:scale-95 border border-slate-700 text-slate-300 flex flex-col items-center justify-center shadow-md transition-all"
              aria-label="역회전"
            >
              <RotateCcw className="w-5 h-5 mb-0.5 text-slate-300" />
              <span className="text-[10px] font-bold">역회전</span>
            </button>

            {/* Hard Drop (Instant slam) - takes full width of action pad */}
            <button
              type="button"
              onPointerDown={handleAction(onHardDrop)}
              disabled={disabled}
              className="col-span-2 h-14 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 active:from-rose-500 active:to-amber-500 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40 border border-amber-400/40 transition-all tracking-wider"
              aria-label="즉시 낙하"
            >
              <ChevronsDown className="w-5 h-5 animate-bounce" />
              <span>하드 드롭 (SLAM)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
