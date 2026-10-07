import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RoadmapConcept } from '../../types';

interface RoadmapConceptCardProps {
  concept: RoadmapConcept;
  onUpdateProgress: (payload: {
    conceptName: string;
    completed?: boolean;
    progressPercentage?: number;
    notes?: string;
  }) => Promise<void>;
  onOpenAIGuide: (concept: RoadmapConcept) => void;
}

export default function RoadmapConceptCard({
  concept,
  onUpdateProgress,
  onOpenAIGuide,
}: RoadmapConceptCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(concept.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showNotesSuccess, setShowNotesSuccess] = useState(false);

  // Local state for subtopic checks (estimated from percentage or tracked locally)
  const initialCheckedCount = Math.round((concept.progressPercentage / 100) * concept.subtopics.length);
  const [checkedSubtopics, setCheckedSubtopics] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    concept.subtopics.forEach((s, idx) => {
      if (concept.completed || idx < initialCheckedCount) {
        map[s.id] = true;
      }
    });
    return map;
  });

  const handleToggleCompleted = async () => {
    const newCompleted = !concept.completed;
    const newPercentage = newCompleted ? 100 : Math.min(concept.progressPercentage, 90);

    // Update checked map
    const newCheckedMap: Record<string, boolean> = {};
    concept.subtopics.forEach((s) => {
      newCheckedMap[s.id] = newCompleted;
    });
    setCheckedSubtopics(newCheckedMap);

    await onUpdateProgress({
      conceptName: concept.name,
      completed: newCompleted,
      progressPercentage: newPercentage,
    });
  };

  const handleSubtopicToggle = async (subtopicId: string) => {
    const updatedMap = {
      ...checkedSubtopics,
      [subtopicId]: !checkedSubtopics[subtopicId],
    };
    setCheckedSubtopics(updatedMap);

    const checkedCount = Object.values(updatedMap).filter(Boolean).length;
    const calculatedPercentage = Math.round((checkedCount / concept.subtopics.length) * 100);
    const isNowComplete = calculatedPercentage === 100;

    await onUpdateProgress({
      conceptName: concept.name,
      completed: isNowComplete,
      progressPercentage: calculatedPercentage,
    });
  };

  const handlePercentageChange = async (newVal: number) => {
    const isNowComplete = newVal === 100;
    await onUpdateProgress({
      conceptName: concept.name,
      completed: isNowComplete,
      progressPercentage: newVal,
    });
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onUpdateProgress({
        conceptName: concept.name,
        notes,
      });
      setShowNotesSuccess(true);
      setTimeout(() => setShowNotesSuccess(false), 2000);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      case 'Intermediate':
        return 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
      case 'Advanced':
        return 'text-purple-700 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Core Foundations':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'Systems & Architecture':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Software & Development':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'Emerging Tech':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div
      className={`glass-card rounded-2xl border transition-all duration-300 overflow-hidden ${
        concept.completed
          ? 'border-emerald-400/50 dark:border-emerald-700/50 bg-emerald-50/10 dark:bg-emerald-950/5'
          : concept.progressPercentage > 0
          ? 'border-purple-300 dark:border-purple-800/60 shadow-sm'
          : 'border-gray-200/80 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      {/* Top Meta Header */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getCategoryColor(concept.category)}`}>
              {concept.category}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getDifficultyColor(concept.difficulty)}`}>
              {concept.difficulty}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              ⏱️ {concept.estimatedHours} hrs
            </span>
          </div>

          <button
            onClick={handleToggleCompleted}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              concept.completed
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-emerald-500 hover:text-emerald-600'
            }`}
          >
            {concept.completed ? '✓ Mastered' : 'Mark Complete'}
          </button>
        </div>

        {/* Concept Title & Overview */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
          <span>{concept.name}</span>
          <span className="text-base font-bold text-purple-600 dark:text-purple-400">
            {concept.progressPercentage}%
          </span>
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
          {concept.description}
        </p>

        {/* Progress Bar & Quick Presets */}
        <div className="mt-4 space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                concept.completed
                  ? 'bg-emerald-500'
                  : concept.progressPercentage > 0
                  ? 'bg-purple-600'
                  : 'bg-transparent'
              }`}
              style={{ width: `${concept.progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span>Progress: {concept.progressPercentage}%</span>
            <div className="flex items-center gap-1">
              {[0, 25, 50, 75, 100].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePercentageChange(preset)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                    concept.progressPercentage === preset
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80">
          <button
            onClick={() => onOpenAIGuide(concept)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 dark:text-purple-300 hover:from-purple-500/20 hover:to-indigo-500/20 border border-purple-200/60 dark:border-purple-800/40 transition-all"
          >
            <span>🤖</span>
            <span>AI Placement Guide</span>
          </button>

          <div className="flex items-center gap-2">
            {concept.progressPercentage === 100 && (
              <button
                onClick={() => navigate(`/quiz/${encodeURIComponent(concept.name)}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm transition-all"
                title="Take the assessment for this subject"
              >
                <span>🎯</span>
                <span>Take Assessment</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
            >
              <span>{isExpanded ? 'Hide Details' : 'Subtopics & Notes'}</span>
              <span>{isExpanded ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Subtopics, Interview Questions, Resources & Notes */}
      {isExpanded && (
        <div className="p-5 sm:p-6 bg-gray-50/60 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 space-y-5 animate-fadeIn">
          {/* Subtopics Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
              <span>Subtopics Checklist ({concept.subtopics.length})</span>
              <span className="text-[11px] font-normal text-purple-600 dark:text-purple-400">
                Check to auto-update progress
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {concept.subtopics.map((subtopic) => {
                const isChecked = !!checkedSubtopics[subtopic.id];
                return (
                  <label
                    key={subtopic.id}
                    className={`flex items-start gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-all ${
                      isChecked
                        ? 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/40 text-purple-900 dark:text-purple-200 font-medium'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleSubtopicToggle(subtopic.id)}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                    />
                    <span className="leading-snug">{subtopic.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Placement Interview Focus */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              💼 Common Interview Questions & Focus Themes
            </h4>
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3 border border-gray-200/80 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 space-y-1.5">
              {concept.interviewFocus.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              📚 Handpicked Learning Resources
            </h4>
            <div className="flex flex-wrap gap-2">
              {concept.resources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs text-purple-600 dark:text-purple-400 border border-gray-200 dark:border-gray-700 hover:border-purple-300 transition-all font-medium"
                >
                  <span>
                    {res.type === 'video'
                      ? '📺'
                      : res.type === 'practice'
                      ? '🎯'
                      : res.type === 'documentation'
                      ? '📖'
                      : '📝'}
                  </span>
                  <span>{res.title}</span>
                  <span className="text-gray-400 text-[10px]">↗</span>
                </a>
              ))}
            </div>
          </div>

          {/* Personal Revision Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                📝 Personal Notes & Revision Formulas
              </h4>
              {showNotesSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Saved to database!
                </span>
              )}
            </div>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your quick formulas, definitions, company pyqs, or key takeaways here..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || notes === (concept.notes || '')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
