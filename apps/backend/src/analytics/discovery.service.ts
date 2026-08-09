import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';

/**
 * Powers /analytics/discovery, /intelligence, /challenges and /constellation.
 *
 * The frontend has been calling all four since launch; none existed, so every
 * request 404'd and roughly ten dashboard, library and calendar sections
 * rendered permanently empty. TypeScript could not surface it because the
 * client declared a return type for a route that was never implemented.
 *
 * Everything here is derived from the user's own library. Where there is not
 * enough data to say something true, these return empty collections rather
 * than inventing content — the fabricated-insight problem this phase also
 * removes from the frontend.
 */

const ACCENTS = [
  'oklch(0.72 0.18 255)',
  'oklch(0.75 0.16 155)',
  'oklch(0.78 0.17 85)',
  'oklch(0.70 0.19 15)',
  'oklch(0.74 0.15 310)',
];

const accentFor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
};

export interface RecommendationItem {
  mediaId: string;
  mediaTitle: string;
  mediaSlug: string;
  mediaType: string;
  posterUrl: string | null;
  accent: string | null;
  reason: string;
  source: string;
  confidence: number;
  compatibility: number;
  discoveryTags: string[];
  year: number;
  rating: number | null;
  genres: string[];
}

interface MediaRowish {
  id?: string;
  title?: string;
  slug?: string;
  posterUrl?: string | null;
  releaseYear?: number | null;
  genres?: string[] | null;
}

/**
 * The repository returns rows where the joined catalog record sits under a
 * per-type key ('movie', 'tvShow', ...) rather than a uniform 'media' field,
 * with the type carried separately on `_mediaType`.
 */
interface LibraryRowish {
  id?: string;
  status?: string;
  rating?: number | null;
  progressPercentage?: number | null;
  _mediaType?: string;
  [key: string]: unknown;
}

const MEDIA_KEYS = ['movie', 'tvShow', 'anime', 'book', 'game', 'musicAlbum', 'podcast', 'course'] as const;

function extractMedia(row: LibraryRowish): MediaRowish | null {
  const key = row._mediaType;
  if (key && typeof row[key] === 'object' && row[key] !== null) {
    return row[key] as MediaRowish;
  }
  for (const k of MEDIA_KEYS) {
    if (typeof row[k] === 'object' && row[k] !== null) return row[k] as MediaRowish;
  }
  return null;
}

@Injectable()
export class DiscoveryService {
  constructor(private readonly repository: AnalyticsRepository) {}

  private toRecommendation(
    row: LibraryRowish,
    reason: string,
    source: string,
    confidence: number,
  ): RecommendationItem | null {
    const media = extractMedia(row);
    // Without a resolved catalog row there is no title, poster or slug to
    // show. Skip rather than render an "Unknown" card.
    if (!media?.id || !media.title) return null;

    return {
      mediaId: media.id,
      mediaTitle: media.title,
      mediaSlug: media.slug ?? '',
      mediaType: row._mediaType ?? 'movie',
      posterUrl: media.posterUrl ?? null,
      accent: accentFor(media.id),
      reason,
      source,
      confidence,
      compatibility: confidence,
      discoveryTags: (media.genres ?? []).slice(0, 3),
      year: media.releaseYear ?? 0,
      rating: row.rating ?? null,
      genres: media.genres ?? [],
    };
  }

  /**
   * Recommendations drawn from what the user already owns.
   *
   * This is deliberately not a recommender over a global catalog — there is no
   * such model here, and pretending otherwise is what produced the fabricated
   * "insights" elsewhere in the app. Every section is a real query over the
   * user's library with an explicit, honest reason string.
   */
  async getDiscovery(userId: string) {
    const [planning, completed, recentlyAdded, genreData] = await Promise.all([
      this.repository.getInProgressByType(userId, 'movie', ['PLANNING'], 20).catch(() => []),
      this.repository.getRecentlyCompleted(userId, 20).catch(() => []),
      this.repository.getRecentlyAdded(userId, 20).catch(() => []),
      this.repository.getGenreData(userId).catch(() => ({}) as Record<string, unknown>),
    ]);

    const plan = (planning as LibraryRowish[])
      .map((r) => this.toRecommendation(r, 'On your list, not started yet', 'planning', 0.8))
      .filter((r): r is RecommendationItem => r !== null);

    const finished = (completed as LibraryRowish[])
      .map((r) => this.toRecommendation(r, 'You finished this', 'completed', 0.7))
      .filter((r): r is RecommendationItem => r !== null);

    const added = (recentlyAdded as LibraryRowish[])
      .map((r) => this.toRecommendation(r, 'Recently added to your library', 'recent', 0.6))
      .filter((r): r is RecommendationItem => r !== null);

    const highlyRated = finished.filter((r) => (r.rating ?? 0) >= 4);

    const topGenres = Object.entries((genreData as { genreCounts?: Record<string, number> })?.genreCounts ?? {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return {
      recommendedToday: plan[0] ?? added[0] ?? null,
      continueMood: plan.slice(0, 6),
      hiddenGems: highlyRated.slice(0, 6),
      continueFranchises: [],
      comfortStories: highlyRated.slice(0, 6),
      seasonalStories: [],
      genreExpansion: topGenres.map(([genre]) => ({
        genre,
        recommendation: plan.find((p) => p.genres.includes(genre)) ?? null,
        yourTopMedia: finished
          .filter((f) => f.genres.includes(genre))
          .slice(0, 4)
          .map((f) => ({ id: f.mediaId, title: f.mediaTitle, posterUrl: f.posterUrl })),
      })),
      creatorRecommendations: [],
      trendingInLibrary: added.slice(0, 6),
      undiscoveredFavorites: plan.slice(6, 12),
      shortWeekendStories: [],
      longJourneyStories: [],
      rewatchSuggestions: highlyRated.slice(0, 4),
      almostFinished: [],
    };
  }

  /**
   * Taste profile and evolution, computed from the library.
   *
   * Fields we cannot derive (preferred companion, time of day, platform) are
   * returned empty rather than guessed. The frontend renders nothing for them,
   * which is the correct outcome: we do not collect that data.
   */
  async getIntelligence(userId: string) {
    const [genreData, completedByType, totals, avgRating, activity] = await Promise.all([
      this.repository.getGenreData(userId).catch(() => ({}) as Record<string, unknown>),
      this.repository.countCompletedByType(userId).catch(() => ({})),
      this.repository.getTotalLibraryItems(userId).catch(() => 0),
      this.repository.getAverageRating(userId).catch(() => null),
      this.repository.getActivityData(userId, 365).catch(() => ({})),
    ]);

    const genreCounts = (genreData as { genreCounts?: Record<string, number> })?.genreCounts ?? {};
    const favoriteGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const completedTotal = Object.values(completedByType as Record<string, number>).reduce(
      (sum, n) => sum + (n ?? 0),
      0,
    );

    // Statements are only emitted when the underlying number actually supports
    // them, and each carries the evidence it was derived from.
    const personalStatements: { statement: string; confidence: number; evidence: string }[] = [];
    if (favoriteGenres.length > 0 && favoriteGenres[0].count >= 3) {
      personalStatements.push({
        statement: `${favoriteGenres[0].name} is the genre you return to most.`,
        confidence: Math.min(0.95, 0.5 + favoriteGenres[0].count / 20),
        evidence: `${favoriteGenres[0].count} titles in your library`,
      });
    }
    if (completedTotal >= 5) {
      personalStatements.push({
        statement: `You've finished ${completedTotal} stories.`,
        confidence: 1,
        evidence: 'Completed items across all media types',
      });
    }
    if (avgRating !== null && completedTotal >= 5) {
      personalStatements.push({
        statement: `You rate what you finish ${avgRating.toFixed(1)} out of 5 on average.`,
        confidence: 0.9,
        evidence: `Mean rating across ${completedTotal} completed items`,
      });
    }

    const byYear = new Map<string, number>();
    for (const [day, count] of Object.entries(activity as Record<string, number>)) {
      const year = day.slice(0, 4);
      byYear.set(year, (byYear.get(year) ?? 0) + count);
    }

    const mediaEvolution = [...byYear.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, count]) => ({
        year,
        focus: favoriteGenres[0]?.name ?? '',
        mediaCount: count,
        hoursSpent: 0,
        topGenre: favoriteGenres[0]?.name ?? '',
        journalCount: 0,
      }));

    return {
      tasteProfile: {
        favoriteGenres,
        favoriteCreators: [],
        favoriteEras: [],
        favoriteLanguages: [],
        favoriteRuntime: '',
        favoritePlatforms: [],
        favoriteSeasons: [],
        favoriteTimeOfDay: '',
        favoriteMood: '',
        favoriteCompanion: '',
        favoriteCompletionPattern: '',
      },
      personalStatements,
      mediaEvolution,
      editorialInsight: favoriteGenres.length > 0 ? `Your library leans towards ${favoriteGenres[0].name}.` : '',
      impactSummary: [
        { label: 'Titles tracked', value: totals },
        { label: 'Completed', value: completedTotal },
      ],
    };
  }

  /**
   * Challenges derived from actual counts.
   *
   * Progress is real; targets are the next round milestone above it, so a
   * challenge is always achievable and never shows as already complete.
   */
  async getChallenges(userId: string) {
    const [statusCounts, completedByType] = await Promise.all([
      this.repository.countByStatus(userId).catch(() => ({})),
      this.repository.countCompletedByType(userId).catch(() => ({})),
    ]);

    const completedTotal = Object.values(completedByType as Record<string, number>).reduce(
      (sum, n) => sum + (n ?? 0),
      0,
    );
    const inProgress =
      (statusCounts as Record<string, number>)['WATCHING'] ?? (statusCounts as Record<string, number>)['READING'] ?? 0;

    const nextMilestone = (n: number): number => {
      for (const step of [5, 10, 25, 50, 100, 250, 500]) if (n < step) return step;
      return Math.ceil((n + 1) / 500) * 500;
    };

    const challenges = [
      {
        id: 'complete-milestone',
        kind: 'completion',
        title: 'Finish what you start',
        description: 'Complete more of the stories in your library.',
        target: nextMilestone(completedTotal),
        current: completedTotal,
        reward: 'Completionist',
        suggestions: [],
        accent: accentFor('completion'),
      },
    ];

    if (inProgress > 0) {
      challenges.push({
        id: 'clear-in-progress',
        kind: 'focus',
        title: 'Clear the backlog',
        description: 'Wrap up the stories you have in progress.',
        target: inProgress,
        current: 0,
        reward: 'Focused',
        suggestions: [],
        accent: accentFor('focus'),
      });
    }

    // Goals are user-authored and there is no goals table yet, so this is
    // honestly empty rather than populated with invented targets.
    return { challenges, goals: [] };
  }

  /** Genre distribution for the constellation chart. */
  async getConstellation(userId: string) {
    const genreData = await this.repository.getGenreData(userId).catch(() => ({}) as Record<string, unknown>);
    const genreCounts = (genreData as { genreCounts?: Record<string, number> })?.genreCounts ?? {};

    return Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([label, count]) => ({
        label,
        count,
        value: count,
        color: accentFor(label),
      }));
  }
}
