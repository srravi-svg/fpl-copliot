// ===== FPL Data Types =====

export interface FPLPlayer {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  team_short_name: string;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  now_cost: number; // price in tenths (e.g. 120 = £12.0)
  total_points: number;
  event_points: number;
  form: string;
  points_per_game: string;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  selected_by_percent: string;
  status: string; // 'a' available, 'i' injured, etc.
  chance_of_playing_next_round: number | null;
  // Computed metrics
  formScore: number;
  minutesReliability: number;
  fixtureScore: number;
  captainScore: number;
}

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
  strength: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

export interface FPLFixture {
  id: number;
  event: number | null; // gameweek
  team_h: number;
  team_a: number;
  team_h_difficulty: number;
  team_a_difficulty: number;
  finished: boolean;
  kickoff_time: string;
}

export interface FPLGameweek {
  id: number;
  name: string;
  deadline_time: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
}

export interface SquadPlayer extends FPLPlayer {
  position: number; // 1-15 (1-11 starting, 12-15 bench)
  is_captain: boolean;
  is_vice_captain: boolean;
  multiplier: number;
}

export interface UserSquad {
  teamId: number | null;
  players: SquadPlayer[];
  gameweek: number;
  isDemo: boolean;
  lastRefreshed: string;
}

export type PositionName = 'GK' | 'DEF' | 'MID' | 'FWD';

export const POSITION_MAP: Record<number, PositionName> = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

export const POSITION_COLORS: Record<PositionName, string> = {
  GK: 'bg-amber-500/20 text-amber-700',
  DEF: 'bg-blue-500/20 text-blue-700',
  MID: 'bg-emerald-500/20 text-emerald-700',
  FWD: 'bg-red-500/20 text-red-700',
};

export interface Recommendation {
  type: 'captain' | 'starting_xi' | 'transfer';
  title: string;
  confidence: 'Low' | 'Medium' | 'High';
  items: RecommendationItem[];
  assumptions: string[];
  whyNot?: string;
}

export interface RecommendationItem {
  player: SquadPlayer;
  reasoning: string[];
  evidence: {
    recentPoints: number[];
    minutesTrend: number[];
    nextFixtures: FixturePreview[];
  };
}

export interface FixturePreview {
  opponent: string;
  isHome: boolean;
  difficulty: number;
  gameweek: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FPLDataState {
  players: FPLPlayer[];
  teams: FPLTeam[];
  fixtures: FPLFixture[];
  gameweeks: FPLGameweek[];
  isLoading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
}
