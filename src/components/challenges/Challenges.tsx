import { getChallenges } from "@/lib/challenges";
import { ChallengeCard } from "./ChallengeCard";

const ofKind = (k: string) => getChallenges().find((c) => c.kind === k);

export const MonthlyChallenge = () => <ChallengeCard challenge={ofKind("Monthly")} />;
export const SeasonChallenge = () => <ChallengeCard challenge={ofKind("Season")} />;
export const WeekendChallenge = () => <ChallengeCard challenge={ofKind("Weekend")} />;
export const CreatorChallenge = () => <ChallengeCard challenge={ofKind("Creator")} />;
export const GenreChallenge = () => <ChallengeCard challenge={ofKind("Genre")} />;
export const MemoryChallenge = () => <ChallengeCard challenge={ofKind("Memory")} />;
export const JournalChallenge = () => <ChallengeCard challenge={ofKind("Journal")} />;
