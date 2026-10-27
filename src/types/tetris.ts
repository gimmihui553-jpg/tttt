export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: TetrominoType;
  shape: number[][];
  color: string;
  glowColor: string;
  borderColor: string;
  position: Position;
}

export type CellValue = {
  type: TetrominoType;
  color: string;
  glowColor: string;
  borderColor: string;
} | null;

export type Board = CellValue[][];

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  combo: number;
  maxCombo: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';
