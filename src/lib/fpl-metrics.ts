import { FPLPlayer, FPLFixture, FPLTeam, SquadPlayer, FixturePreview, POSITION_MAP } from './fpl-types';

/** Compute form score from the form string (last ~5 GW average) */
export function computeFormScore(player: FPLPlayer): number {
  return parseFloat(player.form) || 0;
}

/** Minutes reliability 0–10 scale */
export function computeMinutesReliability(player: FPLPlayer): number {
  const maxMinutes = 2700; // 30 GWs × 90min
  const minutesRatio = Math.min(player.minutes / maxMinutes, 1);
  const injuryPenalty = player.chance_of_playing_next_round !== null
    ? player.chance_of_playing_next_round / 100
    : 1;
  return minutesRatio * injuryPenalty * 10;
}

/** Fixture score for next N fixtures (lower difficulty = higher score) */
export function computeFixtureScore(
  player: FPLPlayer,
  fixtures: FPLFixture[],
  teams: FPLTeam[],
  currentGw: number,
  lookAhead: number = 3
): number {
  const upcoming = fixtures
    .filter(f => f.event !== null && f.event > currentGw && f.event <= currentGw + lookAhead)
    .filter(f => f.team_h === player.team || f.team_a === player.team);

  if (upcoming.length === 0) return 5;

  const weights = [1.0, 0.7, 0.5];
  let totalScore = 0;
  let totalWeight = 0;

  upcoming.slice(0, lookAhead).forEach((fix, i) => {
    const isHome = fix.team_h === player.team;
    const difficulty = isHome ? fix.team_h_difficulty : fix.team_a_difficulty;
    // Invert: FDR 1 (easy) → score 10, FDR 5 (hard) → score 2
    const rawScore = 12 - difficulty * 2;
    const homeBoost = isHome ? 1.1 : 1.0;
    const weight = weights[i] ?? 0.3;
    totalScore += rawScore * homeBoost * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? totalScore / totalWeight : 5;
}

/** Captain score composite */
export function computeCaptainScore(form: number, fixture: number, minutes: number): number {
  return (form * fixture * minutes) / 100;
}

/** Enrich players with computed metrics */
export function enrichPlayers(
  players: FPLPlayer[],
  fixtures: FPLFixture[],
  teams: FPLTeam[],
  currentGw: number
): FPLPlayer[] {
  return players.map(p => {
    const formScore = computeFormScore(p);
    const minutesReliability = computeMinutesReliability(p);
    const fixtureScore = computeFixtureScore(p, fixtures, teams, currentGw);
    const captainScore = computeCaptainScore(formScore, fixtureScore, minutesReliability);
    return { ...p, formScore, minutesReliability, fixtureScore, captainScore };
  });
}

/** Get fixture previews for a player */
export function getFixturePreviews(
  player: FPLPlayer,
  fixtures: FPLFixture[],
  teams: FPLTeam[],
  currentGw: number,
  count: number = 3
): FixturePreview[] {
  const upcoming = fixtures
    .filter(f => f.event !== null && f.event > currentGw && f.event <= currentGw + count)
    .filter(f => f.team_h === player.team || f.team_a === player.team)
    .slice(0, count);

  return upcoming.map(f => {
    const isHome = f.team_h === player.team;
    const opponentId = isHome ? f.team_a : f.team_h;
    const opponent = teams.find(t => t.id === opponentId);
    return {
      opponent: opponent?.short_name ?? '???',
      isHome,
      difficulty: isHome ? f.team_h_difficulty : f.team_a_difficulty,
      gameweek: f.event!,
    };
  });
}

/** Generate rules-based captain recommendation */
export function generateCaptainRec(squad: SquadPlayer[]): SquadPlayer[] {
  const starters = squad.filter(p => p.position <= 11);
  return [...starters]
    .sort((a, b) => b.captainScore - a.captainScore)
    .slice(0, 3);
}

/** Generate rules-based starting XI recommendation */
export function generateStartingXI(squad: SquadPlayer[]): { starting: SquadPlayer[]; bench: SquadPlayer[] } {
  // Sort by composite score within each position, respect formation constraints
  const gks = squad.filter(p => p.element_type === 1).sort((a, b) => b.captainScore - a.captainScore);
  const defs = squad.filter(p => p.element_type === 2).sort((a, b) => b.captainScore - a.captainScore);
  const mids = squad.filter(p => p.element_type === 3).sort((a, b) => b.captainScore - a.captainScore);
  const fwds = squad.filter(p => p.element_type === 4).sort((a, b) => b.captainScore - a.captainScore);

  // Minimum: 1 GK, 3 DEF, 2 MID, 1 FWD = 7 mandatory, 4 flex
  const starting: SquadPlayer[] = [gks[0]];
  const mandatoryDefs = defs.slice(0, 3);
  const mandatoryMids = mids.slice(0, 2);
  const mandatoryFwds = fwds.slice(0, 1);
  starting.push(...mandatoryDefs, ...mandatoryMids, ...mandatoryFwds);

  // Remaining flex picks
  const remaining = [
    ...defs.slice(3),
    ...mids.slice(2),
    ...fwds.slice(1),
  ].sort((a, b) => b.captainScore - a.captainScore);

  const flexNeeded = 11 - starting.length;
  starting.push(...remaining.slice(0, flexNeeded));

  const startingIds = new Set(starting.map(p => p.id));
  const bench = squad.filter(p => !startingIds.has(p.id))
    .sort((a, b) => {
      if (a.element_type === 1) return -1;
      if (b.element_type === 1) return 1;
      return b.captainScore - a.captainScore;
    });

  return { starting, bench };
}

/** FDR color mapping */
export function getFDRColor(difficulty: number): string {
  switch (difficulty) {
    case 1: return 'bg-emerald-600 text-white';
    case 2: return 'bg-emerald-500 text-white';
    case 3: return 'bg-amber-400 text-black';
    case 4: return 'bg-orange-500 text-white';
    case 5: return 'bg-red-600 text-white';
    default: return 'bg-muted text-muted-foreground';
  }
}
