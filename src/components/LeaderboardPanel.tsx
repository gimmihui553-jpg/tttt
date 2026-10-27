import React from 'react';
import { Trophy, Medal, Crown, User as UserIcon, RefreshCw, AlertTriangle, Flame } from 'lucide-react';
import { LeaderboardEntry } from '../firebase/config';
import type { User } from 'firebase/auth';

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  currentUser: User | null;
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onOpenGuide: () => void;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  entries,
  currentUser,
  loading,
  error,
  onRefresh,
  onOpenGuide,
}) => {
  // Format score numbers with commas
  const formatNumber = (num: number) => {
    return (num || 0).toLocaleString();
  };

  // Format date helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '기록됨';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '최근';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
          <h2 className="font-bold text-sm sm:text-base tracking-wider text-slate-100 flex items-center gap-1.5 font-['Orbitron']">
            <span>LEADERBOARD</span>
            <span className="text-xs text-amber-400 font-sans font-semibold">실시간 랭킹</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Warning banner if permission error or unconfigured rules */}
      {error && (
        <div className="m-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Firestore 데이터베이스 규칙 설정 필요</p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Firebase 콘솔에서 읽기/쓰기 보안 규칙을 허용해야 랭킹이 표시됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenGuide}
            className="self-end px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-lg text-[11px] border border-amber-500/30 transition-colors"
          >
            규칙 복사하기 & 가이드 보기 →
          </button>
        </div>
      )}

      {/* User best status snippet if logged in */}
      {currentUser && (
        <div className="px-4 py-2.5 bg-cyan-950/30 border-b border-cyan-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'User'}
                className="w-5 h-5 rounded-full border border-cyan-400/50"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-cyan-400" />
            )}
            <span className="text-slate-300 font-medium truncate max-w-[120px]">
              {currentUser.displayName || '로그인 플레이어'}
            </span>
          </div>
          <span className="text-cyan-300 font-bold flex items-center gap-1 font-['Chakra_Petch']">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            내 최고: {
              formatNumber(
                Math.max(
                  0,
                  ...entries
                    .filter((e) => e.uid === currentUser.uid)
                    .map((e) => e.score)
                )
              )
            }점
          </span>
        </div>
      )}

      {/* Ranking List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1">
        {loading && entries.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
            <span className="text-xs">랭킹 데이터를 불러오는 중...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <Trophy className="w-8 h-8 text-slate-700" />
            <p>아직 등록된 랭킹 점수가 없습니다.</p>
            <p className="text-[11px] text-slate-600">첫 번째 챔피언이 되어 점수를 등록해 보세요!</p>
          </div>
        ) : (
          entries.map((entry, index) => {
            const rank = index + 1;
            const isMe = currentUser && entry.uid === currentUser.uid;

            let rankBadge = (
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-800">
                {rank}
              </span>
            );

            if (rank === 1) {
              rankBadge = (
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-amber-950 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                </span>
              );
            } else if (rank === 2) {
              rankBadge = (
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-slate-900 bg-gradient-to-tr from-slate-300 to-slate-100 shadow-[0_0_8px_rgba(203,213,225,0.5)]">
                  <Medal className="w-3.5 h-3.5 fill-current" />
                </span>
              );
            } else if (rank === 3) {
              rankBadge = (
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-amber-950 bg-gradient-to-tr from-amber-700 to-amber-500 shadow-[0_0_8px_rgba(180,83,9,0.5)]">
                  <Medal className="w-3.5 h-3.5 fill-current" />
                </span>
              );
            }

            return (
              <div
                key={entry.id || `${entry.uid}-${index}`}
                className={`px-3 py-2 flex items-center justify-between transition-colors rounded-lg ${
                  isMe ? 'bg-cyan-950/40 border border-cyan-500/40' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {rankBadge}
                  {entry.photoURL ? (
                    <img
                      src={entry.photoURL}
                      alt={entry.displayName}
                      className="w-7 h-7 rounded-full border border-slate-700 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 text-xs">
                      {entry.displayName?.charAt(0) || 'P'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-slate-200 truncate max-w-[100px] sm:max-w-[130px]">
                        {entry.displayName || '익명'}
                      </p>
                      {isMe && (
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-bold">
                          나
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-['Chakra_Petch']">
                      <span>Lv.{entry.level}</span>
                      <span>•</span>
                      <span>{entry.lines}줄</span>
                      <span>•</span>
                      <span>{formatDate(entry.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs sm:text-sm font-black font-['Chakra_Petch'] tracking-wide ${
                      rank === 1
                        ? 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'
                        : rank <= 3
                        ? 'text-cyan-300'
                        : 'text-slate-200'
                    }`}
                  >
                    {formatNumber(entry.score)}
                  </div>
                  <div className="text-[9px] text-slate-500 font-sans">SCORE</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>실시간 동기화 On</span>
        <button
          onClick={onOpenGuide}
          className="text-cyan-400 hover:text-cyan-300 underline font-medium"
        >
          규칙 & 도메인 설정 안내
        </button>
      </div>
    </div>
  );
};
