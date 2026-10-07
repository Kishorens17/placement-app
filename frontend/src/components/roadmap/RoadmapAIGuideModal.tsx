import { useState } from 'react';

interface RoadmapAIGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  conceptName: string;
  guide: string;
  isLoading: boolean;
  onRegenerate: () => void;
}

export default function RoadmapAIGuideModal({
  isOpen,
  onClose,
  conceptName,
  guide,
  isLoading,
  onRegenerate,
}: RoadmapAIGuideModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(guide);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="glass-card max-w-3xl w-full max-h-[85vh] rounded-2xl flex flex-col shadow-2xl border border-purple-200 dark:border-purple-800/50 bg-white/95 dark:bg-gray-900/95 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-xl">
              🤖
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Placement Prep Guide
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  OpenRouter AI
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Topic: <strong className="text-purple-600 dark:text-purple-400">{conceptName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              title="Regenerate with fresh tips"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              🔄 {isLoading ? 'Generating...' : 'Refresh'}
            </button>
            <button
              onClick={handleCopy}
              disabled={isLoading || !guide}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 transition-all flex items-center gap-1.5"
            >
              {copied ? '✓ Copied!' : '📋 Copy Guide'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Crafting targeted interview strategy & revision notes...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Analyzing core placement questions and high-yield mental models for {conceptName}
              </p>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed font-sans">
              {guide}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/70 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>💡 Tip: Revise key concepts and solve 2-3 interview problems daily to reinforce retention.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
