import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, LogIn, CheckCircle2, AlertCircle, Sparkles, Flame } from 'lucide-react';
import { GameStats } from '../types/tetris';
import { submitScore } from '../firebase/config';
import type { User } from 'firebase/auth';

interface GameOverModalProps {
  stats: GameStats;
  currentUser: User | null;
  onRestart: () => void;
  onLogin: () => Promise<void>;
  onOpenLeaderboard: () => void;
  onOpenGuide: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  currentUser,
  onRestart,
  onLogin,
  onOpenLeaderboard,
  onOpenGuide,
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Trigger celebratory confetti on high scores
  useEffect(() => {
    if (stats.score > 0) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#a855f7', '#f59e0b', '#ec4899', '#22c55e'],
        });
      } catch (e) {}
    }
  }, [stats.score]);

  // Handle score submission
  const handleSubmitScore = async (user: User) => {
    if (submitted || submitting || stats.score <= 0) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitScore({
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || '익명 플레이어',
        photoURL: user.photoURL || undefined,
        email: user.email || undefined,
        score: stats.score,
        lines: stats.lines,
        level: stats.level,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error("Score submission error:", err);
      setSubmitError(err.message || '점수 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit if user is already logged in
  useEffect(() => {
    if (currentUser && !submitted && !submitting && stats.score > 0) {
      handleSubmitScore(currentUser);
    }
  }, [currentUser]);

  const handleLoginAndSubmit = async () => {
    try {
      await onLogin();
    } catch (err: any) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center neon-border-cyan">
        {/* Background ambient neon */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 mb-3 shadow-inner">
          <Trophy className="w-8 h-8 text-rose-400 animate-bounce" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-rose-400 font-['Orbitron'] uppercase mb-1">
          GAME OVER
        </h2>
        <p className="text-xs text-slate-400 mb-6">수고하셨습니다! 이번 게임의 최종 기록입니다.</p>

        {/* Score Card */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 shadow-inner mb-5">
          <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest font-['Orbitron'] mb-1">
            FINAL SCORE
          </div>
          <div className="text-4xl sm:text-5xl font-black text-white font-['Chakra_Petch'] tracking-wide drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
            {stats.score.toLocaleString()}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center font-['Chakra_Petch']">
            <div>
              <div className="text-[10px] text-slate-500 font-sans uppercase">클리어 라인</div>
              <div className="text-lg font-bold text-slate-200">{stats.lines}줄</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-sans uppercase">도달 레벨</div>
              <div className="text-lg font-bold text-amber-400">Lv.{stats.level}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-sans uppercase">최대 콤보</div>
              <div className="text-lg font-bold text-cyan-400 flex items-center justify-center gap-0.5">
                <Flame className="w-4 h-4 text-orange-400" />
                {stats.maxCombo}x
              </div>
            </div>
          </div>
        </div>

        {/* Firebase Ranking Status Section */}
        <div className="mb-6">
          {currentUser ? (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              {submitting && (
                <div className="flex items-center justify-center gap-2 text-cyan-300">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>실시간 랭킹에 점수를 등록하는 중...</span>
                </div>
              )}

              {submitted && (
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>랭킹에 점수가 등록되었습니다!</span>
                </div>
              )}

              {submitError && (
                <div className="space-y-2 text-rose-300">
                  <div className="flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>등록 실패: {submitError}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => handleSubmitScore(currentUser)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-semibold text-slate-200 transition-colors"
                    >
                      다시 시도
                    </button>
                    <button
                      onClick={onOpenGuide}
                      className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 rounded text-[11px] font-semibold text-cyan-300 transition-colors"
                    >
                      규칙 가이드 확인
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-950 border border-cyan-500/30 text-xs text-left">
              <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>점수를 실시간 글로벌 랭킹에 등록하세요!</span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2.5">
                현재 로그인하지 않아 점수가 저장되지 않았습니다. 구글 로그인 시 즉시 이 점수가 랭킹에 반영됩니다.
              </p>
              <button
                onClick={handleLoginAndSubmit}
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <LogIn className="w-4 h-4 text-rose-500" />
                <span>구글 계정으로 로그인하고 점수 등록</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm tracking-wider uppercase transition-all shadow-lg shadow-cyan-950/50 active:scale-95 flex items-center justify-center gap-2 font-['Orbitron']"
          >
            <RefreshCw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>
          <button
            onClick={onOpenLeaderboard}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>랭킹 확인</span>
          </button>
        </div>
      </div>
    </div>
  );
};
