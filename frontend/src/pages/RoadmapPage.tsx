import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import type { RoadmapConcept, RoadmapStats } from '../types';
import { roadmapService } from '../services/roadmap.service';
import RoadmapOverview from '../components/roadmap/RoadmapOverview';
import RoadmapFilters from '../components/roadmap/RoadmapFilters';
import RoadmapConceptCard from '../components/roadmap/RoadmapConceptCard';
import RoadmapAIGuideModal from '../components/roadmap/RoadmapAIGuideModal';

export default function RoadmapPage() {

  const [concepts, setConcepts] = useState<RoadmapConcept[]>([]);
  const [stats, setStats] = useState<RoadmapStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'progress_desc' | 'progress_asc' | 'hours_desc'>('default');

  // AI Guide Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeConcept, setActiveConcept] = useState<RoadmapConcept | null>(null);
  const [aiGuideText, setAiGuideText] = useState('');
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);

  // Fetch initial roadmap data
  const fetchRoadmap = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roadmapService.getRoadmap();
      setConcepts(data.concepts);
      setStats(data.stats);
    } catch (err: any) {
      console.error('Failed to load roadmap:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load CS roadmap');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  // Handle updating concept progress/notes
  const handleUpdateProgress = async (payload: {
    conceptName: string;
    completed?: boolean;
    progressPercentage?: number;
    notes?: string;
  }) => {
    // Optimistic UI update
    setConcepts((prev) =>
      prev.map((c) => {
        if (c.name === payload.conceptName) {
          const updatedPercentage =
            payload.progressPercentage !== undefined ? payload.progressPercentage : c.progressPercentage;
          const updatedCompleted =
            payload.completed !== undefined ? payload.completed : c.completed;
          const updatedNotes = payload.notes !== undefined ? payload.notes : c.notes;
          return {
            ...c,
            progressPercentage: updatedPercentage,
            completed: updatedCompleted,
            notes: updatedNotes,
          };
        }
        return c;
      })
    );

    try {
      const res = await roadmapService.updateProgress(payload);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to save progress to server:', err);
      // Re-fetch to sync
      fetchRoadmap();
    }
  };

  // Handle Opening AI Guide
  const handleOpenAIGuide = async (concept: RoadmapConcept) => {
    setActiveConcept(concept);
    setModalOpen(true);
    setAiGuideText('');
    setIsGeneratingGuide(true);

    try {
      const res = await roadmapService.getAIGuide({
        conceptName: concept.name,
        currentProgress: concept.progressPercentage,
        notes: concept.notes,
      });
      setAiGuideText(res.guide);
    } catch (err) {
      console.error('Failed to generate AI guide:', err);
      setAiGuideText('Failed to generate AI guide. Please check your network or try again.');
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  // Re-generate guide
  const handleRegenerateGuide = async () => {
    if (!activeConcept) return;
    setIsGeneratingGuide(true);
    try {
      const res = await roadmapService.getAIGuide({
        conceptName: activeConcept.name,
        currentProgress: activeConcept.progressPercentage,
        notes: activeConcept.notes,
      });
      setAiGuideText(res.guide);
    } catch (err) {
      console.error('Failed to regenerate guide:', err);
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    concepts.forEach((c) => set.add(c.category));
    return Array.from(set);
  }, [concepts]);

  // Filtered & Sorted concepts
  const filteredConcepts = useMemo(() => {
    let result = [...concepts];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.subtopics.some((s) => s.name.toLowerCase().includes(query)) ||
          c.interviewFocus.some((f) => f.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus === 'completed') {
      result = result.filter((c) => c.completed);
    } else if (selectedStatus === 'in_progress') {
      result = result.filter((c) => !c.completed && c.progressPercentage > 0);
    } else if (selectedStatus === 'not_started') {
      result = result.filter((c) => !c.completed && c.progressPercentage === 0);
    }

    // Sorting
    if (sortBy === 'progress_desc') {
      result.sort((a, b) => b.progressPercentage - a.progressPercentage);
    } else if (sortBy === 'progress_asc') {
      result.sort((a, b) => a.progressPercentage - b.progressPercentage);
    } else if (sortBy === 'hours_desc') {
      result.sort((a, b) => b.estimatedHours - a.estimatedHours);
    }

    return result;
  }, [concepts, searchQuery, selectedCategory, selectedStatus, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <Navbar />

      {/* Subheader */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold text-xs transition-all"
              >
                ← Back to Dashboard
              </Link>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <span>🗺️</span>
                <span>CS Placement Roadmap</span>
              </h1>
            </div>

            <button
              onClick={fetchRoadmap}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5"
            >
              🔄 {isLoading ? 'Syncing...' : 'Sync Progress'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-between">
            <span className="text-sm text-red-700 dark:text-red-300 font-medium">
              ⚠️ {error}
            </span>
            <button
              onClick={fetchRoadmap}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !stats ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Loading your 15 CS Concepts Roadmap...
            </p>
          </div>
        ) : (
          <>
            {/* Overview & Stats Banner */}
            {stats && (
              <RoadmapOverview
                stats={stats}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {/* Filters & Search */}
            <RoadmapFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
              categories={categories}
            />

            {/* Concepts Count Header */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
              <span>
                Showing <strong>{filteredConcepts.length}</strong> of {concepts.length} modules
                {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
              </span>
              {(selectedCategory !== 'All' || selectedStatus !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Concepts Grid */}
            {filteredConcepts.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                <div className="text-4xl">🔍</div>
                <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                  No concepts match your criteria
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Try adjusting your search query, selecting "All Domains", or resetting the completion status filter.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-all"
                >
                  Show All 15 Concepts
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredConcepts.map((concept) => (
                  <RoadmapConceptCard
                    key={concept.name}
                    concept={concept}
                    onUpdateProgress={handleUpdateProgress}
                    onOpenAIGuide={handleOpenAIGuide}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* AI Guide Modal */}
      <RoadmapAIGuideModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        conceptName={activeConcept?.name || ''}
        guide={aiGuideText}
        isLoading={isGeneratingGuide}
        onRegenerate={handleRegenerateGuide}
      />
    </div>
  );
}
