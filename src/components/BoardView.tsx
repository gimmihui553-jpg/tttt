import React, { useMemo } from 'react';
import { Board, Piece } from '../types/tetris';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../utils/tetris';

interface BoardViewProps {
  board: Board;
  currentPiece: Piece | null;
  ghostPiece: Piece | null;
  clearingLines: number[];
  shake?: boolean;
}

export const BoardView: React.FC<BoardViewProps> = ({
  board,
  currentPiece,
  ghostPiece,
  clearingLines,
  shake = false,
}) => {
  // Construct rendered matrix combining board, ghost piece, and active piece
  const renderedCells = useMemo(() => {
    // Clone board state
    const displayGrid: {
      type: 'empty' | 'block' | 'active' | 'ghost';
      color?: string;
      glowColor?: string;
      borderColor?: string;
    }[][] = board.map((row) =>
      row.map((cell) => {
        if (cell) {
          return {
            type: 'block',
            color: cell.color,
            glowColor: cell.glowColor,
            borderColor: cell.borderColor,
          };
        }
        return { type: 'empty' };
      })
    );

    // Overlay ghost piece first
    if (ghostPiece && currentPiece && ghostPiece.position.y !== currentPiece.position.y) {
      for (let r = 0; r < ghostPiece.shape.length; r++) {
        for (let c = 0; c < ghostPiece.shape[r].length; c++) {
          if (ghostPiece.shape[r][c] !== 0) {
            const y = ghostPiece.position.y + r;
            const x = ghostPiece.position.x + c;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              if (displayGrid[y][x].type === 'empty') {
                displayGrid[y][x] = {
                  type: 'ghost',
                  color: ghostPiece.color,
                  glowColor: ghostPiece.glowColor,
                  borderColor: ghostPiece.borderColor,
                };
              }
            }
          }
        }
      }
    }

    // Overlay current active piece
    if (currentPiece) {
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c] !== 0) {
            const y = currentPiece.position.y + r;
            const x = currentPiece.position.x + c;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayGrid[y][x] = {
                type: 'active',
                color: currentPiece.color,
                glowColor: currentPiece.glowColor,
                borderColor: currentPiece.borderColor,
              };
            }
          }
        }
      }
    }

    return displayGrid;
  }, [board, currentPiece, ghostPiece]);

  return (
    <div
      className={`relative p-2 sm:p-3 rounded-2xl bg-slate-950/90 border-2 border-cyan-500/30 neon-border-cyan transition-transform ${
        shake ? 'translate-y-1 scale-[0.99] duration-75' : 'duration-150'
      }`}
    >
      {/* Background ambient glow inside board container */}
      <div className="absolute inset-0 bg-radial from-cyan-500/5 via-transparent to-transparent pointer-events-none rounded-2xl" />

      {/* Grid container */}
      <div
        className="grid gap-[2px] bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner relative overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
          aspectRatio: '10 / 20',
        }}
      >
        {renderedCells.map((row, rIdx) => {
          const isClearing = clearingLines.includes(rIdx);

          return row.map((cell, cIdx) => {
            if (isClearing) {
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="w-full h-full rounded-sm bg-white animate-pulse shadow-[0_0_15px_#fff]"
                />
              );
            }

            if (cell.type === 'active' || cell.type === 'block') {
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{
                    backgroundColor: cell.color,
                    boxShadow: `0 0 10px ${cell.glowColor}`,
                    borderColor: cell.borderColor,
                  }}
                  className="w-full h-full rounded-sm border-t-2 border-l-2 border-b-2 border-r-2 border-t-white/40 border-l-white/20 border-r-black/40 border-b-black/50 transition-all duration-75 relative group"
                >
                  {/* Subtle glossy bevel highlight */}
                  <div className="absolute inset-[2px] rounded-xs bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
                </div>
              );
            }

            if (cell.type === 'ghost') {
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{
                    borderColor: cell.color,
                    boxShadow: `inset 0 0 4px ${cell.glowColor}`,
                  }}
                  className="w-full h-full rounded-sm border border-dashed bg-slate-800/20 opacity-60 transition-all"
                />
              );
            }

            // Empty cell with subtle arcade grid lines
            return (
              <div
                key={`${rIdx}-${cIdx}`}
                className="w-full h-full rounded-xs bg-slate-950/60 border border-slate-800/40 hover:border-slate-700/50 transition-colors"
              />
            );
          });
        })}
      </div>
    </div>
  );
};
