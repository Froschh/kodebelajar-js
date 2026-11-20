import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Play,
  Send,
  RotateCcw,
  Lightbulb,
  BookOpen,
  Terminal,
  StickyNote,
  ChevronRight,
  ChevronDown,
  Award,
  Code2,
  AlertTriangle,
  Sparkles,
  Check,
  XCircle,
} from 'lucide-react';
import { LESSONS } from './data/lessons';

const STORAGE_KEYS = {
  COMPLETED: 'kodebelajar_js_completed_v1',
  CODE_MAP: 'kodebelajar_js_code_v1',
  NOTES_MAP: 'kodebelajar_js_notes_v1',
  ACTIVE_ID: 'kodebelajar_js_active_v1',
};

function runUserCodeInWorker(code, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const workerScript = `
      self.onmessage = function(e) {
        const userCode = e.data.code;
        const logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map(formatVal).join(' ')),
          warn: (...args) => logs.push('[Peringatan] ' + args.map(formatVal).join(' ')),
          error: (...args) => logs.push('[Error] ' + args.map(formatVal).join(' ')),
        };

        function formatVal(v) {
          if (typeof v === 'object' && v !== null) {
            try { return JSON.stringify(v); } catch { return String(v); }
          }
          return String(v);
        }

        try {
          const instrumented = \`
            "use strict";
            \${userCode}
            ;return {
              bahasa: typeof bahasa !== 'undefined' ? bahasa : undefined,
              level: typeof level !== 'undefined' ? level : undefined,
              namaProduk: typeof namaProduk !== 'undefined' ? namaProduk : undefined,
              harga: typeof harga !== 'undefined' ? harga : undefined,
              tersedia: typeof tersedia !== 'undefined' ? tersedia : undefined,
              totalHarga: typeof totalHarga !== 'undefined' ? totalHarga : undefined,
              dapatDiskon: typeof dapatDiskon !== 'undefined' ? dapatDiskon : undefined,
              statusKTP: typeof statusKTP !== 'undefined' ? statusKTP : undefined,
              totalAngka: typeof totalAngka !== 'undefined' ? totalAngka : undefined,
              hasilLuas: typeof hasilLuas !== 'undefined' ? hasilLuas : undefined,
              hitungLuasPersegi: typeof hitungLuasPersegi === 'function' ? hitungLuasPersegi.toString() : undefined,
            };
          \`;
          const fn = new Function('console', instrumented);
          const scope = fn(customConsole);
          self.postMessage({ ok: true, logs, scope });
        } catch (err) {
          self.postMessage({ ok: false, logs, error: err.name + ': ' + err.message });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        ok: false,
        logs: [],
        error:
          'Waktu Eksekusi Habis (Batas 2 detik): Kemungkinan terjadi perulangan tanpa henti (infinite loop).',
      });
    }, timeoutMs);

    worker.onmessage = (event) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      const data = event.data;
      if (data.ok && data.scope && data.scope.hitungLuasPersegi) {
        try {
          data.scope.hitungLuasPersegi = new Function(
            `return (${data.scope.hitungLuasPersegi})`
          )();
        } catch {
          data.scope.hitungLuasPersegi = undefined;
        }
      }
      resolve(data);
    };

    worker.onerror = (err) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        ok: false,
        logs: [],
        error: err.message || 'Terjadi kesalahan sintaks pada kode Anda.',
      });
    };

    worker.postMessage({ code });
  });
}

export default function App() {
  const [activeId, setActiveId] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ID) || LESSONS[0].id;
  });

  const [completedIds, setCompletedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED)) || [];
    } catch {
      return [];
    }
  });

  const [codeMap, setCodeMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CODE_MAP)) || {};
    } catch {
      return {};
    }
  });

  const [notesMap, setNotesMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES_MAP)) || {};
    } catch {
      return {};
    }
  });

  const [revealedHints, setRevealedHints] = useState(0);
  const [notesOpen, setNotesOpen] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [runtimeError, setRuntimeError] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const textareaRef = useRef(null);
  const lineNumberRef = useRef(null);

  const currentIndex = LESSONS.findIndex((l) => l.id === activeId);
  const currentLesson = LESSONS[currentIndex] || LESSONS[0];
  const currentCode =
    codeMap[currentLesson.id] !== undefined
      ? codeMap[currentLesson.id]
      : currentLesson.starterCode;
  const currentNote = notesMap[currentLesson.id] || '';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeId);
  }, [activeId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(completedIds));
  }, [completedIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CODE_MAP, JSON.stringify(codeMap));
  }, [codeMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES_MAP, JSON.stringify(notesMap));
  }, [notesMap]);

  const handleSelectLesson = (id) => {
    setActiveId(id);
    setRevealedHints(0);
    setConsoleOutput([]);
    setRuntimeError(null);
    setTestResults(null);
    setShowSuccessBanner(false);
  };

  const handleCodeChange = (newVal) => {
    setCodeMap((prev) => ({ ...prev, [currentLesson.id]: newVal }));
  };

  const handleNoteChange = (newVal) => {
    setNotesMap((prev) => ({ ...prev, [currentLesson.id]: newVal }));
  };

  const handleResetCode = () => {
    setCodeMap((prev) => ({
      ...prev,
      [currentLesson.id]: currentLesson.starterCode,
    }));
    setConsoleOutput([]);
    setRuntimeError(null);
    setTestResults(null);
    setShowSuccessBanner(false);
  };

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const updated =
        currentCode.substring(0, start) + '  ' + currentCode.substring(end);
      handleCodeChange(updated);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    } else if (e.key === 'Enter') {
      const el = e.target;
      const start = el.selectionStart;
      const before = currentCode.substring(0, start);
      const currentLine = before.split('\n').pop() || '';
      const indentMatch = currentLine.match(/^\s*/);
      let indent = indentMatch ? indentMatch[0] : '';
      if (currentLine.trim().endsWith('{')) {
        indent += '  ';
      }
      e.preventDefault();
      const after = currentCode.substring(el.selectionEnd);
      const updated = before + '\n' + indent + after;
      handleCodeChange(updated);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 1 + indent.length;
      });
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setTestResults(null);
    setShowSuccessBanner(false);
    const result = await runUserCodeInWorker(currentCode, 2000);
    setConsoleOutput(result.logs || []);
    setRuntimeError(result.ok ? null : result.error);
    setIsRunning(false);
  };

  const handleCheckAnswer = async () => {
    setIsRunning(true);
    setShowSuccessBanner(false);
    const result = await runUserCodeInWorker(currentCode, 2000);
    setConsoleOutput(result.logs || []);
    setRuntimeError(result.ok ? null : result.error);

    if (!result.ok) {
      setTestResults([
        {
          label: 'Kode berjalan tanpa error runtime',
          passed: false,
        },
      ]);
      setIsRunning(false);
      return;
    }

    const checks = currentLesson.validate({
      logs: result.logs || [],
      scope: result.scope || {},
    });
    setTestResults(checks);

    const allPassed = checks.every((c) => c.passed);
    if (allPassed) {
      setShowSuccessBanner(true);
      if (!completedIds.includes(currentLesson.id)) {
        setCompletedIds((prev) => [...prev, currentLesson.id]);
      }
    }
    setIsRunning(false);
  };

  const handleNextLesson = () => {
    if (currentIndex < LESSONS.length - 1) {
      handleSelectLesson(LESSONS[currentIndex + 1].id);
    }
  };

  const lineCount = Math.max(currentCode.split('\n').length, 14);
  const progressPercent = Math.round(
    (completedIds.length / LESSONS.length) * 100
  );

  const groupedModules = LESSONS.reduce((acc, lesson) => {
    if (!acc[lesson.module]) acc[lesson.module] = [];
    acc[lesson.module].push(lesson);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-100">
                KodeBelajar
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                JavaScript Fundamentals
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/70 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            Belajar Bebas Tanpa Batas • Tersimpan Otomatis
          </span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/50 flex flex-col overflow-y-auto max-h-[40vh] lg:max-h-[calc(100vh-3.5rem)]">
          <div className="p-4 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
              <span>Progres Belajar</span>
              <span className="text-emerald-400 font-semibold">
                {completedIds.length}/{LESSONS.length} Materi Selesai
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <nav className="p-3 space-y-5 flex-1">
            {Object.entries(groupedModules).map(([moduleName, lessons]) => (
              <div key={moduleName}>
                <h3 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  {moduleName}
                </h3>
                <div className="space-y-1">
                  {lessons.map((lesson) => {
                    const isCompleted = completedIds.includes(lesson.id);
                    const isActive = lesson.id === currentLesson.id;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 transition-all text-sm ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-medium shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : isActive ? (
                            <div className="w-4 h-4 rounded-full border-2 border-emerald-400 flex items-center justify-center shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            </div>
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 shrink-0">
                          {lesson.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <section className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 flex flex-col overflow-y-auto lg:max-h-[calc(100vh-3.5rem)]">
          <div className="p-5 space-y-5 flex-1">
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{currentLesson.module}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-100">
                {currentLesson.title}
              </h1>
            </div>

            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              {currentLesson.explanation.map((block, idx) => {
                if (block.type === 'text') {
                  return <p key={idx}>{block.content}</p>;
                }
                if (block.type === 'list') {
                  return (
                    <ul
                      key={idx}
                      className="list-disc pl-5 space-y-1.5 text-slate-300"
                    >
                      {block.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === 'code') {
                  return (
                    <pre
                      key={idx}
                      className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed"
                    >
                      <code>{block.content}</code>
                    </pre>
                  );
                }
                return null;
              })}
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                <Award className="w-4 h-4" />
                <span>Tantangan / Latihan</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {currentLesson.challenge}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() =>
                  setRevealedHints((prev) =>
                    Math.min(prev + 1, currentLesson.hints.length)
                  )
                }
                disabled={revealedHints >= currentLesson.hints.length}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-300 border border-slate-700 transition"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>
                  {revealedHints === 0
                    ? 'Lihat Hint'
                    : revealedHints < currentLesson.hints.length
                    ? `Hint Berikutnya (${revealedHints}/${currentLesson.hints.length})`
                    : 'Semua Hint Terbuka'}
                </span>
              </button>

              <button
                onClick={handleResetCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Kode</span>
              </button>
            </div>

            {revealedHints > 0 && (
              <div className="space-y-2 p-3.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-xs font-semibold text-amber-400">
                  Petunjuk Pengerjaan:
                </div>
                <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-300">
                  {currentLesson.hints
                    .slice(0, revealedHints)
                    .map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                </ol>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={() => setNotesOpen((o) => !o)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-slate-100 py-1.5"
              >
                <span className="flex items-center gap-1.5">
                  <StickyNote className="w-3.5 h-3.5 text-sky-400" />
                  Catatan Pribadi (Tersimpan Otomatis)
                </span>
                {notesOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {notesOpen && (
                <textarea
                  value={currentNote}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Tulis rangkuman atau catatan pentingmu untuk materi ini..."
                  rows={3}
                  className="mt-2 w-full rounded-lg bg-slate-900 border border-slate-800 focus:border-sky-500/60 focus:outline-none p-2.5 text-xs text-slate-200 placeholder:text-slate-500 resize-y"
                />
              )}
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 bg-slate-900 flex flex-col lg:max-h-[calc(100vh-3.5rem)]">
          <div className="h-11 px-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span>solusi.js</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-sky-400" />
                <span>{isRunning ? 'Menjalankan...' : 'Jalankan Kode'}</span>
              </button>

              <button
                onClick={handleCheckAnswer}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Cek Jawaban</span>
              </button>
            </div>
          </div>

          <div className="relative flex-1 min-h-[260px] flex bg-slate-950 font-mono text-sm overflow-hidden">
            <div
              ref={lineNumberRef}
              aria-hidden="true"
              className="w-11 py-4 pr-3 text-right select-none text-slate-600 bg-slate-900/60 border-r border-slate-800/80 overflow-hidden leading-6 text-xs"
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={currentCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              onScroll={(e) => {
                if (lineNumberRef.current) {
                  lineNumberRef.current.scrollTop = e.target.scrollTop;
                }
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              placeholder="// Tulis kode JavaScript kamu di sini..."
              className="flex-1 p-4 bg-transparent text-slate-100 focus:outline-none resize-none leading-6 font-mono text-xs sm:text-sm overflow-auto"
            />
          </div>

          {showSuccessBanner && (
            <div className="p-4 bg-emerald-950/90 border-t border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-emerald-300">
                    Luar Biasa! Semua Uji Coba Berhasil
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    Materi ini telah ditandai selesai di progres belajarmu.
                  </p>
                </div>
              </div>

              {currentIndex < LESSONS.length - 1 ? (
                <button
                  onClick={handleNextLesson}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shrink-0"
                >
                  <span>Materi Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Semua Materi Selesai!
                </span>
              )}
            </div>
          )}

          <div className="h-56 border-t border-slate-800 bg-slate-950 flex flex-col shrink-0">
            <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/70 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Konsol Output & Validasi</span>
              </div>
              {(consoleOutput.length > 0 || runtimeError || testResults) && (
                <button
                  onClick={() => {
                    setConsoleOutput([]);
                    setRuntimeError(null);
                    setTestResults(null);
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  Bersihkan
                </button>
              )}
            </div>

            <div className="p-3.5 overflow-y-auto flex-1 font-mono text-xs space-y-2.5">
              {testResults && (
                <div className="space-y-1.5 pb-2 border-b border-slate-800">
                  <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                    Hasil Pemeriksaan:
                  </div>
                  {testResults.map((t, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 font-sans text-xs ${
                        t.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {t.passed ? (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{t.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {runtimeError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{runtimeError}</span>
                </div>
              )}

              {consoleOutput.length > 0 ? (
                <div className="space-y-1">
                  {consoleOutput.map((line, i) => (
                    <div key={i} className="text-slate-200 flex gap-2">
                      <span className="text-slate-600 select-none">&gt;</span>
                      <span className="whitespace-pre-wrap break-all">
                        {line}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                !runtimeError &&
                !testResults && (
                  <div className="text-slate-600 italic">
                    Klik "Jalankan Kode" untuk melihat output console.log(), atau
                    "Cek Jawaban" untuk menguji solusimu.
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}