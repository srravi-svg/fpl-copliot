import { FPLPlayer, FPLTeam, FPLFixture, FPLGameweek, SquadPlayer } from './fpl-types';
import { enrichPlayers } from './fpl-metrics';
import { DEMO_TEAMS } from './demo-data';
import { supabase } from '@/integrations/supabase/client';

const FPL_PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fpl-proxy`;

async function proxyFetch(endpoint: string) {
  const response = await fetch(`${FPL_PROXY_URL}?endpoint=${encodeURIComponent(endpoint)}`, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status}`);
  }
  return response.json();
}

export async function fetchBootstrapData(): Promise<{
  players: FPLPlayer[];
  teams: FPLTeam[];
  gameweeks: FPLGameweek[];
}> {
  const data = await proxyFetch('bootstrap-static/');

  const teams: FPLTeam[] = data.teams.map((t: any) => ({
    id: t.id,
    name: t.name,
    short_name: t.short_name,
    strength: t.strength,
    strength_overall_home: t.strength_overall_home,
    strength_overall_away: t.strength_overall_away,
    strength_attack_home: t.strength_attack_home,
    strength_attack_away: t.strength_attack_away,
    strength_defence_home: t.strength_defence_home,
    strength_defence_away: t.strength_defence_away,
  }));

  const teamMap = new Map(teams.map(t => [t.id, t.short_name]));

  const players: FPLPlayer[] = data.elements.map((p: any) => ({
    id: p.id,
    web_name: p.web_name,
    first_name: p.first_name,
    second_name: p.second_name,
    team: p.team,
    team_short_name: teamMap.get(p.team) ?? '???',
    element_type: p.element_type,
    now_cost: p.now_cost,
    total_points: p.total_points,
    event_points: p.event_points,
    form: p.form,
    points_per_game: p.points_per_game,
    minutes: p.minutes,
    goals_scored: p.goals_scored,
    assists: p.assists,
    clean_sheets: p.clean_sheets,
    selected_by_percent: p.selected_by_percent,
    status: p.status,
    chance_of_playing_next_round: p.chance_of_playing_next_round,
    formScore: 0,
    minutesReliability: 0,
    fixtureScore: 0,
    captainScore: 0,
  }));

  const gameweeks: FPLGameweek[] = data.events.map((e: any) => ({
    id: e.id,
    name: e.name,
    deadline_time: e.deadline_time,
    is_current: e.is_current,
    is_next: e.is_next,
    finished: e.finished,
  }));

  return { players, teams, gameweeks };
}

export async function fetchFixtures(): Promise<FPLFixture[]> {
  const data = await proxyFetch('fixtures/');
  return data.map((f: any) => ({
    id: f.id,
    event: f.event,
    team_h: f.team_h,
    team_a: f.team_a,
    team_h_difficulty: f.team_h_difficulty,
    team_a_difficulty: f.team_a_difficulty,
    finished: f.finished,
    kickoff_time: f.kickoff_time,
  }));
}

export async function fetchSquadPicks(teamId: number, gameweek: number, allPlayers: FPLPlayer[]): Promise<SquadPlayer[]> {
  const playerMap = new Map(allPlayers.map(p => [p.id, p]));

  // Try requested GW first, then walk back up to 3 GWs to find the latest with data
  for (let gw = gameweek; gw >= Math.max(1, gameweek - 3); gw--) {
    try {
      const data = await proxyFetch(`entry/${teamId}/event/${gw}/picks/`);
      return data.picks.map((pick: any) => {
        const player = playerMap.get(pick.element);
        if (!player) return null;
        return {
          ...player,
          position: pick.position,
          is_captain: pick.is_captain,
          is_vice_captain: pick.is_vice_captain,
          multiplier: pick.multiplier,
        } as SquadPlayer;
      }).filter(Boolean) as SquadPlayer[];
    } catch {
      // Try previous gameweek
      continue;
    }
  }
  throw new Error('Could not load squad picks. Try a different gameweek or use the demo squad.');
}
