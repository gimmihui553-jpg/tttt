import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Music, 
  Trophy, 
  Flame, 
  Sparkles, 
  LogIn, 
  LogOut, 
  HelpCircle, 
  Gamepad2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  checkRedirectAuth, 
  subscribeToLeaderboard, 
  LeaderboardEntry 
} from './firebase/config';
import { useTetris } from './hooks/useTetris';
import { sound } from './utils/sound';
import { BoardView } from './components/BoardView';
import { PiecePreview } from './components/PiecePreview';
import { MobileControls } from './components/MobileControls';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { GameOverModal } from './components/GameOverModal';
import { FirebaseGuideModal } from './components/FirebaseGuideModal';

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  // Sound States
  const [sfxOn, setSfxOn] = useState<boolean>(sound.sfxEnabled);
  const [bgmOn, setBgmOn] = useState<boolean>(sound.bgmEnabled);

  // Modals & Mobile View Tab
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'game' | 'leaderboard'>('game');
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [finalGameOverStats, setFinalGameOverStats] = useState<any>(null);

  // Local Best Score
  const [localBestScore, setLocalBestScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('tetris_local_best') || 0);
    } catch {
      return 0;
    }
  });

  // Tetris Game Hook
  const {
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
    togglePause,
    moveLeft,
    moveRight,
    moveDown,
    hardDrop,
    rotateClockwise,
    rotateCounterClockwise,
    hold,
  } = useTetris({
    onGameOver: (gameOverStats) => {
      setFinalGameOverStats(gameOverStats);
      setShowGameOverModal(true);
      if (gameOverStats.score > localBestScore) {
        setLocalBestScore(gameOverStats.score);
        try {
          localStorage.setItem('tetris_local_best', String(gameOverStats.score));
        } catch {}
      }
    },
  });

  // Firebase Auth listener
  useEffect(() => {
    checkRedirectAuth().catch((err) => {
      console.warn("Redirect auth checked:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      setAuthError(null);
    });

    return () => unsubscribe();
  }, []);

  // Firebase Firestore Leaderboard real-time subscription
  useEffect(() => {
    setLeaderboardLoading(true);
    const unsubscribe = subscribeToLeaderboard(30, (scores, error) => {
      setLeaderboardLoading(false);
      if (error) {
        setLeaderboardError(error);
      } else {
        setLeaderboard(scores);
        setLeaderboardError(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Toggle Sound Effects
  const handleToggleSfx = () => {
    const nextVal = !sfxOn;
    setSfxOn(nextVal);
    sound.setSfx(nextVal);
  };

  // Toggle Background Music
  const handleToggleBgm = () => {
    const nextVal = !bgmOn;
    setBgmOn(nextVal);
    sound.setBgm(nextVal);
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setAuthError('현재 도메인이 Firebase 승인 도메인에 등록되어 있지 않습니다. [설정 가이드]에서 승인 도메인을 추가해주세요!');
        setIsGuideOpen(true);
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('브라우저의 팝업 차단이 활성화되어 있습니다. 팝업을 허용해주세요.');
      } else {
        setAuthError(err.message || '로그인에 실패했습니다.');
      }
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans scanline-bg relative selection:bg-cyan-500 selection:text-black">
      {/* Background neon ambient gradients */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-500 font-['Orbitron']">
                NEON TETRIS
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Firebase 실시간 랭킹 & 구글 로그인 아케이드
              </p>
            </div>
          </div>

          {/* Center Sound & Guide Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Guide Button */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Firebase 규칙 및 GitHub 배포 가이드"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">규칙 & 도메인 설정</span>
              <span className="md:hidden">가이드</span>
            </button>

            {/* SFX Toggle */}
            <button
              onClick={handleToggleSfx}
              className={`p-2 rounded-xl border text-xs transition-all ${
                sfxOn
                  ? 'bg-slate-900 border-cyan-500/40 text-cyan-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
              title={sfxOn ? '효과음 끄기' : '효과음 켜기'}
              aria-label="효과음"
            >
              {sfxOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* BGM Toggle */}
            <button
              onClick={handleToggleBgm}
              className={`p-2 rounded-xl border text-xs transition-all ${
                bgmOn
                  ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
              title={bgmOn ? '배경음악 정지' : '8비트 테트리스 테마 BGM 재생'}
              aria-label="배경음악"
            >
              <Music className={`w-4 h-4 ${bgmOn ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* User Auth Section */}
          <div className="flex items-center gap-2">
            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-1 pl-2 sm:pl-3 rounded-full shadow-inner">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-cyan-400"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center text-xs font-bold">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {user.displayName || '플레이어'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-500" />
                <span>구글 로그인</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Error Banner */}
      {authError && (
        <div className="bg-rose-950/80 border-b border-rose-500/50 px-4 py-2 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="text-cyan-300 underline font-semibold ml-2 hover:text-cyan-200"
          >
            해결 가이드 열기
          </button>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-slate-800 bg-slate-950/80 px-4 pt-2">
        <button
          onClick={() => setMobileTab('game')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'game'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>테트리스 게임</span>
        </button>
        <button
          onClick={() => setMobileTab('leaderboard')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'leaderboard'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>실시간 랭킹 ({leaderboard.length})</span>
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          
          {/* ================= LEFT SIDEBAR (Stats & Hold) ================= */}
          <div
            className={`lg:col-span-3 flex flex-col gap-3 sm:gap-4 order-2 lg:order-1 ${
              mobileTab === 'leaderboard' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* HOLD Box */}
            <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800/90 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 tracking-wider font-['Orbitron']">HOLD</span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                  [C] 키
                </span>
              </div>
              <PiecePreview type={holdPiece} size={20} className={!canHold && status === 'playing' ? 'opacity-40' : ''} />
            </div>

            {/* Score & Statistics */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/90 backdrop-blur-sm shadow-xl space-y-4">
              {/* Current Score */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1 uppercase font-['Orbitron']">
                  <span>SCORE</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-['Chakra_Petch'] tracking-wide">
                  {stats.score.toLocaleString()}
                </div>
              </div>

              {/* Best High Score */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1 uppercase font-['Orbitron']">
                  <span>HIGH SCORE</span>
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-['Chakra_Petch']">
                  {Math.max(stats.score, localBestScore).toLocaleString()}
                </div>
              </div>

              {/* Level & Lines & Combo Grid */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 font-['Chakra_Petch']">
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">LEVEL</span>
                  <span className="text-xl font-black text-purple-400">Lv.{stats.level}</span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">LINES</span>
                  <span className="text-xl font-black text-emerald-400">{stats.lines}줄</span>
                </div>
              </div>

              {/* Combo Counter */}
              {stats.combo > 1 && (
                <div className="p-2 rounded-xl bg-orange-950/40 border border-orange-500/40 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-1.5 text-orange-400 font-bold text-xs">
                    <Flame className="w-4 h-4 fill-orange-400" />
                    <span>연속 콤보!</span>
                  </div>
                  <span className="text-sm font-black text-orange-300 font-['Chakra_Petch']">
                    {stats.combo} COMBO
                  </span>
                </div>
              )}
            </div>

            {/* Keyboard Guide (Desktop) */}
            <div className="hidden lg:block bg-slate-900/60 rounded-2xl p-4 border border-slate-800/60 text-xs text-slate-400 space-y-1.5">
              <span className="font-bold text-slate-300 block mb-2 font-['Orbitron'] text-[11px]">
                KEYBOARD CONTROLS
              </span>
              <div className="flex justify-between">
                <span>좌 / 우 이동</span>
                <span className="text-slate-200 font-mono">← / → (A, D)</span>
              </div>
              <div className="flex justify-between">
                <span>블록 회전</span>
                <span className="text-cyan-400 font-mono">↑ / Z (W)</span>
              </div>
              <div className="flex justify-between">
                <span>소프트 드롭</span>
                <span className="text-slate-200 font-mono">↓ (S)</span>
              </div>
              <div className="flex justify-between">
                <span>하드 드롭 (즉시)</span>
                <span className="text-rose-400 font-mono">Space</span>
              </div>
              <div className="flex justify-between">
                <span>홀드 (보관)</span>
                <span className="text-purple-400 font-mono">C / Shift</span>
              </div>
              <div className="flex justify-between">
                <span>일시정지</span>
                <span className="text-slate-200 font-mono">P / ESC</span>
              </div>
            </div>
          </div>

          {/* ================= CENTER COLUMN (Tetris Board & Controls) ================= */}
          <div
            className={`lg:col-span-5 flex flex-col items-center justify-center order-1 lg:order-2 ${
              mobileTab === 'leaderboard' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Top Quick Action Bar */}
            <div className="w-full max-w-xs flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-400 tracking-wider font-['Orbitron']">
                MATRIX 10x20
              </span>
              {status === 'playing' && (
                <button
                  onClick={togglePause}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Pause className="w-3 h-3" />
                  <span>일시정지</span>
                </button>
              )}
            </div>

            {/* Board View Wrapper with Overlays */}
            <div className="relative w-full max-w-[320px] sm:max-w-[350px]">
              <BoardView
                board={board}
                currentPiece={currentPiece}
                ghostPiece={ghostPiece}
                clearingLines={clearingLines}
                shake={shake}
              />

              {/* IDLE / START OVERLAY */}
              {status === 'idle' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md rounded-2xl border-2 border-cyan-500/50">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white mb-4 shadow-xl shadow-cyan-500/30 animate-pulse">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                  <h3 className="text-xl font-black text-white font-['Orbitron'] tracking-wider mb-2">
                    READY TO PLAY?
                  </h3>
                  <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
                    구글 로그인 시 실시간 글로벌 랭킹에 점수가 자동 등록됩니다!
                  </p>
                  <button
                    onClick={startGame}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm tracking-wider uppercase transition-all shadow-xl shadow-cyan-500/40 active:scale-95 font-['Orbitron']"
                  >
                    START GAME
                  </button>
                </div>
              )}

              {/* PAUSED OVERLAY */}
              {status === 'paused' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md rounded-2xl border-2 border-amber-500/50">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                    <Pause className="w-6 h-6 fill-current" />
                  </div>
                  <h3 className="text-xl font-black text-white font-['Orbitron'] tracking-wider mb-5">
                    GAME PAUSED
                  </h3>
                  <div className="flex flex-col gap-2.5 w-full max-w-[200px]">
                    <button
                      onClick={togglePause}
                      className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 font-['Orbitron']"
                    >
                      RESUME
                    </button>
                    <button
                      onClick={startGame}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                    >
                      RESTART
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile / Touch On-Screen Controls */}
            <div className="w-full max-w-[350px] mt-2">
              <MobileControls
                onMoveLeft={moveLeft}
                onMoveRight={moveRight}
                onMoveDown={moveDown}
                onHardDrop={hardDrop}
                onRotateCw={rotateClockwise}
                onRotateCcw={rotateCounterClockwise}
                onHold={hold}
                disabled={status !== 'playing'}
              />
            </div>
          </div>

          {/* ================= RIGHT SIDEBAR (Next Queue & Leaderboard) ================= */}
          <div
            className={`lg:col-span-4 flex flex-col gap-4 order-3 ${
              mobileTab === 'game' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* NEXT Queue (preview next 3 pieces) */}
            <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800/90 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 tracking-wider font-['Orbitron']">NEXT</span>
                <span className="text-[10px] text-cyan-400 font-mono">3 PIECES</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {nextQueue.map((nextType, idx) => (
                  <PiecePreview
                    key={`${nextType}-${idx}`}
                    type={nextType}
                    size={14}
                    className="p-1.5"
                  />
                ))}
              </div>
            </div>

            {/* Leaderboard Panel */}
            <div className="flex-1 min-h-[460px] max-h-[580px]">
              <LeaderboardPanel
                entries={leaderboard}
                currentUser={user}
                loading={leaderboardLoading}
                error={leaderboardError}
                onOpenGuide={() => setIsGuideOpen(true)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>네온 테트리스 아케이드 (Neon Tetris) • Firebase Firestore 실시간 동기화</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              Firestore 보안 규칙 & 도메인 설정 안내
            </button>
          </div>
        </div>
      </footer>

      {/* Game Over Modal */}
      {showGameOverModal && finalGameOverStats && (
        <GameOverModal
          stats={finalGameOverStats}
          currentUser={user}
          onRestart={() => {
            setShowGameOverModal(false);
            startGame();
          }}
          onLogin={handleGoogleLogin}
          onOpenLeaderboard={() => {
            setShowGameOverModal(false);
            setMobileTab('leaderboard');
          }}
          onOpenGuide={() => {
            setShowGameOverModal(false);
            setIsGuideOpen(true);
          }}
        />
      )}

      {/* Firebase & GitHub Deployment Help Modal */}
      <FirebaseGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
