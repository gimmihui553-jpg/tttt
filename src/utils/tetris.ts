import { Board, CellValue, Piece, Position, TetrominoType } from '../types/tetris';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINOES: Record<
  TetrominoType,
  {
    shape: number[][];
    color: string;
    glowColor: string;
    borderColor: string;
  }
> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#06b6d4', // cyan-500
    glowColor: 'rgba(6, 182, 212, 0.65)',
    borderColor: '#67e8f9',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#3b82f6', // blue-500
    glowColor: 'rgba(59, 130, 246, 0.65)',
    borderColor: '#93c5fd',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f97316', // orange-500
    glowColor: 'rgba(249, 115, 22, 0.65)',
    borderColor: '#fdba74',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#eab308', // yellow-500
    glowColor: 'rgba(234, 179, 8, 0.65)',
    borderColor: '#fde047',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#22c55e', // green-500
    glowColor: 'rgba(34, 197, 94, 0.65)',
    borderColor: '#86efac',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a855f7', // purple-500
    glowColor: 'rgba(168, 85, 247, 0.65)',
    borderColor: '#d8b4fe',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#ef4444', // red-500
    glowColor: 'rgba(239, 68, 68, 0.65)',
    borderColor: '#fca5a5',
  },
};

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

// 7-bag randomizer gives fair, tournament-standard piece distribution
export function generateBag(): TetrominoType[] {
  const pieces: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}

export function createPiece(type: TetrominoType): Piece {
  const meta = TETROMINOES[type];
  const shape = meta.shape.map((row) => [...row]);
  // Center horizontally
  const x = Math.floor((BOARD_WIDTH - shape[0].length) / 2);
  const y = 0;
  return {
    type,
    shape,
    color: meta.color,
    glowColor: meta.glowColor,
    borderColor: meta.borderColor,
    position: { x, y },
  };
}

export function rotateMatrix(matrix: number[][], clockwise: boolean = true): number[][] {
  const n = matrix.length;
  const result: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (clockwise) {
        result[x][n - 1 - y] = matrix[y][x];
      } else {
        result[n - 1 - x][y] = matrix[y][x];
      }
    }
  }
  return result;
}

// Check if piece collides with walls or existing blocks
export function checkCollision(
  board: Board,
  piece: Piece,
  offset: Position = { x: 0, y: 0 },
  customShape?: number[][]
): boolean {
  const shape = customShape || piece.shape;
  const targetX = piece.position.x + offset.x;
  const targetY = piece.position.y + offset.y;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const boardX = targetX + x;
        const boardY = targetY + y;

        // Wall collisions
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return true;
        }

        // Top buffer allowance
        if (boardY < 0) {
          continue;
        }

        // Cell occupied collision
        if (board[boardY] && board[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

// Calculate ghost piece projection at bottom
export function getGhostPiece(board: Board, piece: Piece): Piece {
  let dropDistance = 0;
  while (!checkCollision(board, piece, { x: 0, y: dropDistance + 1 })) {
    dropDistance++;
  }

  return {
    ...piece,
    position: {
      x: piece.position.x,
      y: piece.position.y + dropDistance,
    },
  };
}

// Merge piece into board when locked
export function mergePieceToBoard(board: Board, piece: Piece): Board {
  const newBoard = board.map((row) => [...row]);

  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] !== 0) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = {
            type: piece.type,
            color: piece.color,
            glowColor: piece.glowColor,
            borderColor: piece.borderColor,
          };
        }
      }
    }
  }

  return newBoard;
}

// Clear lines and return new board, cleared line indices, and count
export function clearCompletedLines(board: Board): {
  newBoard: Board;
  linesCleared: number;
  clearedIndices: number[];
} {
  const clearedIndices: number[] = [];
  const remainingRows: CellValue[][] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    const isComplete = board[y].every((cell) => cell !== null);
    if (isComplete) {
      clearedIndices.push(y);
    } else {
      remainingRows.push(board[y]);
    }
  }

  const linesCleared = clearedIndices.length;
  if (linesCleared === 0) {
    return { newBoard: board, linesCleared: 0, clearedIndices: [] };
  }

  // Add new empty rows on top
  const newRows = Array.from({ length: linesCleared }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );

  return {
    newBoard: [...newRows, ...remainingRows],
    linesCleared,
    clearedIndices,
  };
}

// Score formula based on standard guideline
export function calculateLineScore(lines: number, level: number): number {
  switch (lines) {
    case 1:
      return 100 * level;
    case 2:
      return 300 * level;
    case 3:
      return 500 * level;
    case 4:
      return 800 * level; // TETRIS!
    default:
      return 0;
  }
}

// Drop speed based on level in milliseconds
export function getDropInterval(level: number): number {
  return Math.max(70, Math.floor(1000 * Math.pow(0.85, level - 1)));
}
