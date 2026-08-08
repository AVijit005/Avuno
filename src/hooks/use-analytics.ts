import { useCurrentUser } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";

export function useDashboard() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.analytics.dashboard(),
    enabled: !!user,
    queryFn: () => analyticsApi.getDashboard(),
    staleTime: 2 * 60_000,
  });
}

export function useOverview() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.analytics.overview(),
    enabled: !!user,
    queryFn: () => analyticsApi.getOverview(),
    staleTime: 5 * 60_000,
  });
}

export function useStreaks() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.analytics.streaks(),
    enabled: !!user,
    queryFn: () => analyticsApi.getStreaks(),
    staleTime: 5 * 60_000,
  });
}

export function useMediaAnalytics() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.analytics.media(),
    enabled: !!user,
    queryFn: () => analyticsApi.getMediaAnalytics(),
    staleTime: 5 * 60_000,
  });
}

export function useGenreAnalytics() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.analytics.genres(),
    enabled: !!user,
    queryFn: () => analyticsApi.getGenreAnalytics(),
    staleTime: 5 * 60_000,
  });
}

export function useActivity() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.analytics.activity(),
    enabled: !!user,
    queryFn: () => analyticsApi.getActivity(),
    staleTime: 5 * 60_000,
  });
}

export function useCalendar(year?: number, month?: number) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.analytics.calendar(year, month),
    enabled: !!user,
    queryFn: () => analyticsApi.getCalendar(year, month),
    staleTime: 5 * 60_000,
  });
}

export function useCalendarYear(year: number) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: [...queryKeys.analytics.all, "calendar-rich", year] as const,
    enabled: !!user,
    queryFn: () => analyticsApi.getCalendarYear(year),
    staleTime: 5 * 60_000,
  });
}

export function useInsights() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.analytics.insights(),
    enabled: !!user,
    queryFn: () => analyticsApi.getInsights(),
    staleTime: 5 * 60_000,
  });
}

export function useDiscovery() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: [...queryKeys.analytics.all, "discovery"] as const,
    enabled: !!user,
    queryFn: () => analyticsApi.getDiscovery(),
    staleTime: 2 * 60_000,
  });
}

export function useChallenges() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: [...queryKeys.analytics.all, "challenges"] as const,
    enabled: !!user,
    queryFn: () => analyticsApi.getChallenges(),
    staleTime: 5 * 60_000,
  });
}

export function useIntelligence() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: [...queryKeys.analytics.all, "intelligence"] as const,
    enabled: !!user,
    queryFn: () => analyticsApi.getIntelligence(),
    staleTime: 5 * 60_000,
  });
}
