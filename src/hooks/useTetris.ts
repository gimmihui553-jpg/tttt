import { useState, useEffect, useRef, useCallback } from 'react';
import { Board, GameStats, GameStatus, Piece, TetrominoType } from '../types/tetris';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  calculateLineScore,
  checkCollision,
  createEmptyBoard,
  createPiece,
  generateBag,
  getDropInterval,
  getGhostPiece,
  mergePieceToBoard,
  clearCompletedLines,
  rotateMatrix,
} from '../utils/tetris';
import { sound } from '../utils/sound';

export interface UseTetrisOptions {
  onGameOver?: (finalStats: GameStats) => void;
  onLineClear?: (lines: number, isTetris: boolean) => void;
  onLevelUp?: (newLevel: number) => void;
}

export function useTetris({ onGameOver, onLineClear, onLevelUp }: UseTetrisOptions = {}) {
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [clearingLines, setClearingLines] = useState<number[]>([]);
  const [shake, setShake] = useState<boolean>(false);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lines: 0,
    level: 1,
    combo: 0,
    maxCombo: 0,
  });

  // Bag of pieces ref
  const bagRef = useRef<TetrominoType[]>([]);
  const requestDropRef = useRef<number | null>(null);
  const lastDropTimeRef = useRef<number>(0);
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 250);
  }, []);

  // Pop next piece from bag
  const popNextPiece = useCallback((): TetrominoType => {
    if (bagRef.current.length < 5) {
      bagRef.current = [...bagRef.current, ...generateBag()];
    }
    const piece = bagRef.current.shift()!;
    setNextQueue([...bagRef.current.slice(0, 3)]);
    return piece;
  }, []);

  // Initialize game
  const startGame = useCallback(() => {
    bagRef.current = [...generateBag(), ...generateBag()];
    const firstPieceType = bagRef.current.shift()!;
    const initialPiece = createPiece(firstPieceType);
    const initialQueue = bagRef.current.slice(0, 3);

    setBoard(createEmptyBoard());
    setCurrentPiece(initialPiece);
    setHoldPiece(null);
    setCanHold(true);
    setNextQueue(initialQueue);
    setClearingLines([]);
    setStats({
      score: 0,
      lines: 0,
      level: 1,
      combo: 0,
      maxCombo: 0,
    });
    setStatus('playing');
    lastDropTimeRef.current = performance.now();
  }, []);

  const pauseGame = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
    }
  }, [status]);

  const resumeGame = useCallback(() => {
    if (status === 'paused') {
      lastDropTimeRef.current = performance.now();
      setStatus('playing');
    }
  }, [status]);

  const togglePause = useCallback(() => {
    if (status === 'playing') pauseGame();
    else if (status === 'paused') resumeGame();
  }, [status, pauseGame, resumeGame]);

  // Lock piece and handle line clears
  const lockPiece = useCallback(
    (pieceToLock: Piece, currentBoard: Board) => {
      const mergedBoard = mergePieceToBoard(currentBoard, pieceToLock);
      const { newBoard, linesCleared, clearedIndices } = clearCompletedLines(mergedBoard);

      if (linesCleared > 0) {
        sound.playClear(linesCleared);
        if (linesCleared === 4) {
          triggerShake();
        }
        setClearingLines(clearedIndices);

        setTimeout(() => {
          setClearingLines([]);
          setBoard(newBoard);
        }, 150);

        setStats((prev) => {
          const newLines = prev.lines + linesCleared;
          const newLevel = Math.floor(newLines / 10) + 1;
          const lineScore = calculateLineScore(linesCleared, prev.level);
          const combo = prev.combo + 1;
          const comboBonus = combo > 1 ? (combo - 1) * 50 * prev.level : 0;
          const newScore = prev.score + lineScore + comboBonus;

          if (newLevel > prev.level) {
            sound.playLevelUp();
            onLevelUp?.(newLevel);
          }

          onLineClear?.(linesCleared, linesCleared === 4);

          return {
            score: newScore,
            lines: newLines,
            level: newLevel,
            combo,
            maxCombo: Math.max(prev.maxCombo, combo),
          };
        });
      } else {
        setBoard(mergedBoard);
        setStats((prev) => ({
          ...prev,
          combo: 0,
        }));
      }

      // Spawn next piece
      const nextType = popNextPiece();
      const nextPiece = createPiece(nextType);

      // Check Game Over condition
      if (checkCollision(newBoard, nextPiece)) {
        setStatus('gameover');
        sound.playGameOver();
        onGameOver?.(statsRef.current);
        return;
      }

      setCurrentPiece(nextPiece);
      setCanHold(true);
    },
    [popNextPiece, onGameOver, onLineClear, onLevelUp, triggerShake]
  );

  // Soft drop (move down 1 step)
  const moveDown = useCallback((): boolean => {
    if (status !== 'playing' || !currentPiece) return false;

    if (!checkCollision(board, currentPiece, { x: 0, y: 1 })) {
      setCurrentPiece((prev) => (prev ? { ...prev, position: { ...prev.position, y: prev.position.y + 1 } } : null));
      setStats((prev) => ({ ...prev, score: prev.score + 1 }));
      return true;
    } else {
      lockPiece(currentPiece, board);
      return false;
    }
  }, [status, currentPiece, board, lockPiece]);

  // Hard drop (instantly drop to bottom and lock)
  const hardDrop = useCallback(() => {
    if (status !== 'playing' || !currentPiece) return;

    sound.playHardDrop();
    triggerShake();

    const ghost = getGhostPiece(board, currentPiece);
    const dropDistance = ghost.position.y - currentPiece.position.y;

    setStats((prev) => ({
      ...prev,
      score: prev.score + dropDistance * 2,
    }));

    lockPiece(ghost, board);
  }, [status, currentPiece, board, lockPiece, triggerShake]);

  // Move horizontally
  const moveHorizontal = useCallback(
    (dir: -1 | 1) => {
      if (status !== 'playing' || !currentPiece) return;

      if (!checkCollision(board, currentPiece, { x: dir, y: 0 })) {
        sound.playMove();
        setCurrentPiece((prev) => (prev ? { ...prev, position: { ...prev.position, x: prev.position.x + dir } } : null));
      }
    },
    [status, currentPiece, board]
  );

  // Rotate piece with basic wall kick tries
  const rotate = useCallback(
    (clockwise: boolean = true) => {
      if (status !== 'playing' || !currentPiece) return;

      const rotatedShape = rotateMatrix(currentPiece.shape, clockwise);
      // Wall kick offsets to try: 0, +1, -1, +2, -2, -1 vertical
      const kickOffsets: { x: number; y: number }[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 2, y: 0 },
        { x: -2, y: 0 },
        { x: 0, y: -1 },
      ];

      for (const offset of kickOffsets) {
        if (
          !checkCollision(
            board,
            { ...currentPiece, position: { x: currentPiece.position.x + offset.x, y: currentPiece.position.y + offset.y } },
            { x: 0, y: 0 },
            rotatedShape
          )
        ) {
          sound.playRotate();
          setCurrentPiece((prev) =>
            prev
              ? {
                  ...prev,
                  shape: rotatedShape,
                  position: {
                    x: prev.position.x + offset.x,
                    y: prev.position.y + offset.y,
                  },
                }
              : null
          );
          return;
        }
      }
    },
    [status, currentPiece, board]
  );

  // Hold Piece
  const hold = useCallback(() => {
    if (status !== 'playing' || !currentPiece || !canHold) return;

    sound.playHold();
    const currentType = currentPiece.type;

    if (holdPiece === null) {
      setHoldPiece(currentType);
      const nextType = popNextPiece();
      setCurrentPiece(createPiece(nextType));
    } else {
      setHoldPiece(currentType);
      setCurrentPiece(createPiece(holdPiece));
    }
    setCanHold(false);
  }, [status, currentPiece, canHold, holdPiece, popNextPiece]);

  // Main game loop (drop timer based on level)
  useEffect(() => {
    if (status !== 'playing') {
      if (requestDropRef.current) {
        cancelAnimationFrame(requestDropRef.current);
      }
      return;
    }

    const dropInterval = getDropInterval(stats.level);

    const loop = (timestamp: number) => {
      if (!lastDropTimeRef.current) lastDropTimeRef.current = timestamp;

      const elapsed = timestamp - lastDropTimeRef.current;
      if (elapsed >= dropInterval) {
        lastDropTimeRef.current = timestamp;
        if (currentPiece && !checkCollision(board, currentPiece, { x: 0, y: 1 })) {
          setCurrentPiece((prev) => (prev ? { ...prev, position: { ...prev.position, y: prev.position.y + 1 } } : null));
        } else if (currentPiece) {
          lockPiece(currentPiece, board);
        }
      }

      requestDropRef.current = requestAnimationFrame(loop);
    };

    requestDropRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestDropRef.current) {
        cancelAnimationFrame(requestDropRef.current);
      }
    };
  }, [status, stats.level, currentPiece, board, lockPiece]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          moveHorizontal(1);
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          rotate(true);
          break;
        case 'KeyZ':
          e.preventDefault();
          rotate(false);
          break;
        case 'Space':
          e.preventDefault();
          hardDrop();
          break;
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
          e.preventDefault();
          hold();
          break;
        case 'KeyP':
        case 'Escape':
          e.preventDefault();
          togglePause();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveHorizontal, moveDown, rotate, hardDrop, hold, togglePause]);

  // Ghost piece calculated from board and current piece
  const ghostPiece = currentPiece ? getGhostPiece(board, currentPiece) : null;

  return {
    board,
    currentPiece,
    ghostPiece,
    holdPiece,
    nextQueue,
    stats,
    status,
    clearingLines,
    shake,
    canHold,
    startGame,
    pauseGame,
    resumeGame,
    togglePause,
    moveLeft: () => moveHorizontal(-1),
    moveRight: () => moveHorizontal(1),
    moveDown,
    hardDrop,
    rotateClockwise: () => rotate(true),
    rotateCounterClockwise: () => rotate(false),
    hold,
  };
}
