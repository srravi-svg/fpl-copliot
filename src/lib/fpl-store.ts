import { UserSquad, SquadPlayer, FPLDataState, FPLPlayer, FPLTeam, FPLFixture, FPLGameweek } from './fpl-types';
import { getDemoSquad, DEMO_TEAMS, DEMO_FIXTURES, DEMO_GAMEWEEKS } from './demo-data';

const STORAGE_KEY = 'fpl-copilot-squad';

export function saveSquad(squad: UserSquad): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(squad));
}

export function loadSquad(): UserSquad | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserSquad;
  } catch {
    return null;
  }
}

export function clearSquad(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function createDemoSquad(gameweek: number = 28): UserSquad {
  return {
    teamId: null,
    players: getDemoSquad(),
    gameweek,
    isDemo: true,
    lastRefreshed: new Date().toISOString(),
  };
}

export function getDemoData(): FPLDataState {
  return {
    players: getDemoSquad() as unknown as FPLPlayer[],
    teams: DEMO_TEAMS,
    fixtures: DEMO_FIXTURES,
    gameweeks: DEMO_GAMEWEEKS,
    isLoading: false,
    error: null,
    lastRefreshed: new Date(),
  };
}
