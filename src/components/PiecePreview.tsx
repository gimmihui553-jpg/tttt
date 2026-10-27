import React from 'react';
import { TetrominoType } from '../types/tetris';
import { TETROMINOES } from '../utils/tetris';

interface PiecePreviewProps {
  type: TetrominoType | null;
  size?: number;
  label?: string;
  className?: string;
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({
  type,
  size = 18,
  label,
  className = '',
}) => {
  if (!type) {
    return (
      <div className={`flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 ${className}`}>
        {label && <span className="text-xs font-bold tracking-wider text-slate-400 mb-2 uppercase">{label}</span>}
        <div className="w-16 h-16 flex items-center justify-center text-slate-600 text-xs">
          EMPTY
        </div>
      </div>
    );
  }

  const meta = TETROMINOES[type];
  const shape = meta.shape;

  // Trim empty rows/cols for aesthetic centering
  const filledRows = shape.filter((row) => row.some((c) => c !== 0));
  const height = filledRows.length;
  const width = shape[0].length;

  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg ${className}`}>
      {label && (
        <span className="text-[11px] font-bold tracking-widest text-slate-400 mb-2 uppercase">
          {label}
        </span>
      )}
      <div
        className="grid gap-[2px] items-center justify-center"
        style={{
          gridTemplateColumns: `repeat(${shape[0].length}, ${size}px)`,
        }}
      >
        {shape.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              style={{
                width: size,
                height: size,
                backgroundColor: cell ? meta.color : 'transparent',
                boxShadow: cell ? `0 0 8px ${meta.glowColor}` : 'none',
                borderColor: cell ? meta.borderColor : 'transparent',
              }}
              className={`rounded-sm transition-all duration-150 ${
                cell ? 'border border-t-white/40 border-l-white/30 border-r-black/30 border-b-black/40' : ''
              }`}
            />
          ))
        )}
      </div>
    </div>
  );
};
