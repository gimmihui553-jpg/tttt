import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  Globe, 
  Github, 
  ExternalLink, 
  Key, 
  Terminal,
  Database
} from 'lucide-react';

interface FirebaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'domains' | 'github'>('rules');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 테트리스 랭킹 컬렉션 규칙
    match /tetris_leaderboard/{scoreId} {
      // 1. 누구나 랭킹 목록을 조회(읽기)할 수 있습니다.
      allow read: if true;
      
      // 2. 구글 로그인한 사용자만 본인의 유효한 점수를 등록할 수 있습니다.
      allow create: if request.auth != null
                    && request.resource.data.uid == request.auth.uid
                    && request.resource.data.score is number
                    && request.resource.data.score >= 0;
                    
      // 3. 등록된 점수의 변조 및 삭제는 금지합니다.
      allow update, delete: if false;
    }
  }
}`;

  const githubActionWorkflow = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Firebase & GitHub 배포 설정 가이드</h3>
              <p className="text-xs text-slate-400">규칙 복사 및 승인 도메인 등록 방법</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'rules'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. Firestore 보안 규칙</span>
          </button>
          <button
            onClick={() => setActiveTab('domains')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'domains'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. 승인 도메인 추가</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'github'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>3. GitHub Pages 배포</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm text-slate-300">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-cyan-200 text-xs">
                <strong>💡 왜 보안 규칙이 필요한가요?</strong>
                <p className="mt-1 text-slate-300">
                  Firebase Firestore의 기본 설정은 보안을 위해 모든 읽기/쓰기를 차단하거나 30일 후 만료됩니다.
                  아래 규칙을 설정하면 <span className="text-cyan-400 font-semibold">누구나 랭킹 목록을 조회</span>할 수 있고,
                  <span className="text-cyan-400 font-semibold"> 구글 로그인한 사람만 자신의 점수를 안전하게 등록</span>할 수 있습니다.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Firestore 보안 규칙 코드 (복사하여 붙여넣기):
                  </span>
                  <button
                    onClick={() => copyToClipboard(firestoreRulesCode, 'rules')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow"
                  >
                    {copiedKey === 'rules' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>규칙 복사하기</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] sm:text-xs text-cyan-300 overflow-x-auto select-all leading-relaxed">
                  {firestoreRulesCode}
                </pre>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl space-y-2 border border-slate-700/60 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <span>📌 Firebase 콘솔 적용 순서</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>
                    <a
                      href="https://console.firebase.google.com/project/ai-studio-practice/firestore/rules"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 underline font-semibold hover:text-cyan-300 inline-flex items-center gap-1"
                    >
                      Firebase 콘솔 [Firestore Database] &gt; [규칙 (Rules)] 열기
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </li>
                  <li>기존 내용을 지우고 위의 규칙 코드를 붙여넣습니다.</li>
                  <li>상단의 파란색 <strong>[게시 (Publish)]</strong> 버튼을 누르면 즉시 적용됩니다.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'domains' && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-cyan-200 text-xs">
                <strong>💡 왜 승인 도메인을 추가해야 하나요?</strong>
                <p className="mt-1 text-slate-300">
                  구글 로그인은 보안을 위해 사전에 Firebase에 등록된 도메인에서만 작동합니다.
                  등록되지 않은 도메인에서 로그인 시 <code className="text-rose-400 bg-rose-950/60 px-1 py-0.5 rounded">auth/unauthorized-domain</code> 에러가 발생합니다.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">추가해야 할 필수 도메인 목록:</h4>

                {/* GitHub Pages domain */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-amber-400 font-bold block">1. 깃허브 배포 도메인 (GitHub Pages)</span>
                    <span className="font-mono text-xs sm:text-sm text-cyan-300">your-username.github.io</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">(본인의 GitHub 아이디를 넣으세요)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('github.io', 'domain_gh')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                  >
                    {copiedKey === 'domain_gh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Current preview domain */}
                {currentHost && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-cyan-400 font-bold block">2. 현재 테스트 미리보기 도메인</span>
                      <span className="font-mono text-xs sm:text-sm text-cyan-300 break-all">{currentHost}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(currentHost, 'domain_curr')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 shrink-0 ml-2"
                    >
                      {copiedKey === 'domain_curr' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>복사</span>
                    </button>
                  </div>
                )}

                {/* Localhost */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold block">3. 로컬 개발 환경 (보통 기본 등록됨)</span>
                    <span className="font-mono text-xs sm:text-sm text-slate-300">localhost</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl space-y-2 border border-slate-700/60 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <span>📌 Firebase 콘솔 등록 경로</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>
                    <a
                      href="https://console.firebase.google.com/project/ai-studio-practice/authentication/settings"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 underline font-semibold hover:text-cyan-300 inline-flex items-center gap-1"
                    >
                      Firebase 콘솔 [Authentication] &gt; [설정 (Settings)] 열기
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </li>
                  <li>[승인된 도메인 (Authorized Domains)] 섹션으로 이동합니다.</li>
                  <li><strong>[도메인 추가 (Add Domain)]</strong> 버튼을 클릭하고 도메인을 추가합니다.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-cyan-200 text-xs">
                <strong>🚀 GitHub Pages 배포 팁</strong>
                <p className="mt-1 text-slate-300">
                  GitHub Pages는 서브디렉토리 (예: <code className="text-cyan-300 font-mono">username.github.io/tetris-game/</code>) 경로에서 서빙되므로, <code className="text-cyan-300 font-mono">vite.config.ts</code>의 base 경로를 <code className="text-cyan-300 font-mono">./</code> (상대 경로)로 설정해 두었습니다! 빌드 결과물(<code className="text-cyan-300 font-mono">dist/</code>)이 어디에 위치하든 완벽하게 작동합니다.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  방법 1: gh-pages 패키지로 1초 배포 (추천)
                </h4>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                  <div className="text-slate-400"># 1. gh-pages 패키지 설치</div>
                  <div className="text-cyan-300 bg-slate-900 p-2 rounded flex justify-between items-center">
                    <span>npm install --save-dev gh-pages</span>
                    <button
                      onClick={() => copyToClipboard('npm install --save-dev gh-pages', 'npm_gh')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'npm_gh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="text-slate-400 mt-2"># 2. 빌드 및 배포 실행</div>
                  <div className="text-cyan-300 bg-slate-900 p-2 rounded flex justify-between items-center">
                    <span>npm run build && npx gh-pages -d dist</span>
                    <button
                      onClick={() => copyToClipboard('npm run build && npx gh-pages -d dist', 'npm_deploy')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'npm_deploy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Github className="w-4 h-4 text-purple-400" />
                    방법 2: GitHub Actions 자동 배포 워크플로우 (.github/workflows/deploy.yml)
                  </h4>
                  <button
                    onClick={() => copyToClipboard(githubActionWorkflow, 'gh_action')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    {copiedKey === 'gh_action' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>코드 복사</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-40 leading-relaxed">
                  {githubActionWorkflow}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">Firebase Project: ai-studio-practice</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-md"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
