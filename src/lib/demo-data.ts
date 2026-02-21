import { FPLPlayer, FPLTeam, FPLFixture, FPLGameweek, SquadPlayer } from './fpl-types';

// Premier League teams for 2024/25
export const DEMO_TEAMS: FPLTeam[] = [
  { id: 1, name: 'Arsenal', short_name: 'ARS', strength: 5, strength_overall_home: 1350, strength_overall_away: 1340, strength_attack_home: 1350, strength_attack_away: 1340, strength_defence_home: 1340, strength_defence_away: 1330 },
  { id: 2, name: 'Aston Villa', short_name: 'AVL', strength: 4, strength_overall_home: 1250, strength_overall_away: 1220, strength_attack_home: 1260, strength_attack_away: 1230, strength_defence_home: 1240, strength_defence_away: 1210 },
  { id: 3, name: 'Bournemouth', short_name: 'BOU', strength: 3, strength_overall_home: 1150, strength_overall_away: 1120, strength_attack_home: 1170, strength_attack_away: 1130, strength_defence_home: 1130, strength_defence_away: 1110 },
  { id: 6, name: 'Chelsea', short_name: 'CHE', strength: 4, strength_overall_home: 1280, strength_overall_away: 1260, strength_attack_home: 1300, strength_attack_away: 1270, strength_defence_home: 1260, strength_defence_away: 1250 },
  { id: 7, name: 'Crystal Palace', short_name: 'CRY', strength: 3, strength_overall_home: 1140, strength_overall_away: 1100, strength_attack_home: 1130, strength_attack_away: 1090, strength_defence_home: 1150, strength_defence_away: 1110 },
  { id: 8, name: 'Everton', short_name: 'EVE', strength: 2, strength_overall_home: 1080, strength_overall_away: 1040, strength_attack_home: 1060, strength_attack_away: 1020, strength_defence_home: 1100, strength_defence_away: 1060 },
  { id: 11, name: 'Liverpool', short_name: 'LIV', strength: 5, strength_overall_home: 1360, strength_overall_away: 1350, strength_attack_home: 1370, strength_attack_away: 1360, strength_defence_home: 1350, strength_defence_away: 1340 },
  { id: 12, name: 'Man City', short_name: 'MCI', strength: 5, strength_overall_home: 1370, strength_overall_away: 1360, strength_attack_home: 1380, strength_attack_away: 1370, strength_defence_home: 1360, strength_defence_away: 1350 },
  { id: 13, name: 'Man Utd', short_name: 'MUN', strength: 4, strength_overall_home: 1230, strength_overall_away: 1200, strength_attack_home: 1250, strength_attack_away: 1210, strength_defence_home: 1210, strength_defence_away: 1190 },
  { id: 14, name: 'Newcastle', short_name: 'NEW', strength: 4, strength_overall_home: 1270, strength_overall_away: 1240, strength_attack_home: 1280, strength_attack_away: 1250, strength_defence_home: 1260, strength_defence_away: 1230 },
  { id: 17, name: 'Tottenham', short_name: 'TOT', strength: 4, strength_overall_home: 1260, strength_overall_away: 1230, strength_attack_home: 1290, strength_attack_away: 1250, strength_defence_home: 1230, strength_defence_away: 1210 },
  { id: 20, name: 'Wolves', short_name: 'WOL', strength: 3, strength_overall_home: 1130, strength_overall_away: 1100, strength_attack_home: 1120, strength_attack_away: 1090, strength_defence_home: 1140, strength_defence_away: 1110 },
  { id: 4, name: 'Brighton', short_name: 'BHA', strength: 4, strength_overall_home: 1220, strength_overall_away: 1200, strength_attack_home: 1240, strength_attack_away: 1210, strength_defence_home: 1200, strength_defence_away: 1190 },
  { id: 5, name: 'Brentford', short_name: 'BRE', strength: 3, strength_overall_home: 1180, strength_overall_away: 1140, strength_attack_home: 1200, strength_attack_away: 1150, strength_defence_home: 1160, strength_defence_away: 1130 },
  { id: 9, name: 'Fulham', short_name: 'FUL', strength: 3, strength_overall_home: 1160, strength_overall_away: 1130, strength_attack_home: 1150, strength_attack_away: 1120, strength_defence_home: 1170, strength_defence_away: 1140 },
  { id: 10, name: 'Ipswich', short_name: 'IPS', strength: 2, strength_overall_home: 1050, strength_overall_away: 1020, strength_attack_home: 1040, strength_attack_away: 1010, strength_defence_home: 1060, strength_defence_away: 1030 },
  { id: 15, name: 'Nott\'m Forest', short_name: 'NFO', strength: 3, strength_overall_home: 1190, strength_overall_away: 1160, strength_attack_home: 1170, strength_attack_away: 1140, strength_defence_home: 1210, strength_defence_away: 1180 },
  { id: 16, name: 'Southampton', short_name: 'SOU', strength: 2, strength_overall_home: 1060, strength_overall_away: 1030, strength_attack_home: 1050, strength_attack_away: 1020, strength_defence_home: 1070, strength_defence_away: 1040 },
  { id: 18, name: 'West Ham', short_name: 'WHU', strength: 3, strength_overall_home: 1170, strength_overall_away: 1140, strength_attack_home: 1180, strength_attack_away: 1150, strength_defence_home: 1160, strength_defence_away: 1130 },
  { id: 19, name: 'Leicester', short_name: 'LEI', strength: 2, strength_overall_home: 1090, strength_overall_away: 1060, strength_attack_home: 1080, strength_attack_away: 1050, strength_defence_home: 1100, strength_defence_away: 1070 },
];

// Demo squad — a realistic strong FPL squad
const demoPlayers: Omit<SquadPlayer, 'formScore' | 'minutesReliability' | 'fixtureScore' | 'captainScore'>[] = [
  // GK
  { id: 401, code: 176297, web_name: 'Raya', first_name: 'David', second_name: 'Raya', team: 1, team_short_name: 'ARS', element_type: 1, now_cost: 55, total_points: 145, event_points: 6, form: '5.2', points_per_game: '4.8', minutes: 2700, goals_scored: 0, assists: 1, clean_sheets: 12, selected_by_percent: '28.5', status: 'a', chance_of_playing_next_round: 100, position: 1, is_captain: false, is_vice_captain: false, multiplier: 1 },
  // DEF
  { id: 283, code: 169187, web_name: 'Alexander-Arnold', first_name: 'Trent', second_name: 'Alexander-Arnold', team: 11, team_short_name: 'LIV', element_type: 2, now_cost: 72, total_points: 168, event_points: 8, form: '6.8', points_per_game: '5.6', minutes: 2520, goals_scored: 3, assists: 10, clean_sheets: 11, selected_by_percent: '35.2', status: 'a', chance_of_playing_next_round: 100, position: 2, is_captain: false, is_vice_captain: false, multiplier: 1 },
  { id: 6, code: 153256, web_name: 'Saliba', first_name: 'William', second_name: 'Saliba', team: 1, team_short_name: 'ARS', element_type: 2, now_cost: 60, total_points: 142, event_points: 6, form: '5.0', points_per_game: '4.7', minutes: 2700, goals_scored: 2, assists: 1, clean_sheets: 12, selected_by_percent: '22.1', status: 'a', chance_of_playing_next_round: 100, position: 3, is_captain: false, is_vice_captain: false, multiplier: 1 },
  { id: 355, code: 214048, web_name: 'Pedro Porro', first_name: 'Pedro', second_name: 'Porro', team: 17, team_short_name: 'TOT', element_type: 2, now_cost: 56, total_points: 130, event_points: 2, form: '4.2', points_per_game: '4.3', minutes: 2520, goals_scored: 4, assists: 7, clean_sheets: 7, selected_by_percent: '18.3', status: 'a', chance_of_playing_next_round: 100, position: 4, is_captain: false, is_vice_captain: false, multiplier: 1 },
  { id: 504, code: 444145, web_name: 'Murillo', first_name: 'Murillo', second_name: 'Santiago', team: 15, team_short_name: 'NFO', element_type: 2, now_cost: 46, total_points: 115, event_points: 6, form: '4.5', points_per_game: '3.8', minutes: 2610, goals_scored: 1, assists: 2, clean_sheets: 10, selected_by_percent: '15.8', status: 'a', chance_of_playing_next_round: 100, position: 5, is_captain: false, is_vice_captain: false, multiplier: 1 },
  // MID
  { id: 328, code: 118748, web_name: 'Salah', first_name: 'Mohamed', second_name: 'Salah', team: 11, team_short_name: 'LIV', element_type: 3, now_cost: 132, total_points: 218, event_points: 13, form: '8.5', points_per_game: '7.3', minutes: 2610, goals_scored: 19, assists: 13, clean_sheets: 11, selected_by_percent: '62.4', status: 'a', chance_of_playing_next_round: 100, position: 6, is_captain: true, is_vice_captain: false, multiplier: 2 },
  { id: 301, code: 244699, web_name: 'Palmer', first_name: 'Cole', second_name: 'Palmer', team: 6, team_short_name: 'CHE', element_type: 3, now_cost: 110, total_points: 195, event_points: 10, form: '7.8', points_per_game: '6.5', minutes: 2700, goals_scored: 16, assists: 11, clean_sheets: 7, selected_by_percent: '48.1', status: 'a', chance_of_playing_next_round: 100, position: 7, is_captain: false, is_vice_captain: true, multiplier: 1 },
  { id: 19, code: 223340, web_name: 'Saka', first_name: 'Bukayo', second_name: 'Saka', team: 1, team_short_name: 'ARS', element_type: 3, now_cost: 105, total_points: 175, event_points: 7, form: '6.5', points_per_game: '5.8', minutes: 2430, goals_scored: 11, assists: 12, clean_sheets: 10, selected_by_percent: '31.6', status: 'a', chance_of_playing_next_round: 100, position: 8, is_captain: false, is_vice_captain: false, multiplier: 1 },
  { id: 415, code: 225902, web_name: 'Mbeumo', first_name: 'Bryan', second_name: 'Mbeumo', team: 5, team_short_name: 'BRE', element_type: 3, now_cost: 78, total_points: 155, event_points: 5, form: '5.5', points_per_game: '5.2', minutes: 2610, goals_scored: 13, assists: 6, clean_sheets: 5, selected_by_percent: '25.7', status: 'a', chance_of_playing_next_round: 100, position: 9, is_captain: false, is_vice_captain: false, multiplier: 1 },
  // FWD
  { id: 318, code: 223094, web_name: 'Haaland', first_name: 'Erling', second_name: 'Haaland', team: 12, team_short_name: 'MCI', element_type: 4, now_cost: 148, total_points: 205, event_points: 9, form: '7.2', points_per_game: '6.8', minutes: 2520, goals_scored: 22, assists: 4, clean_sheets: 8, selected_by_percent: '55.3', status: 'a', chance_of_playing_next_round: 100, position: 10, is_captain: false, is_vice_captain: false, multiplier: 1 },
  { id: 442, code: 200439, web_name: 'Isak', first_name: 'Alexander', second_name: 'Isak', team: 14, team_short_name: 'NEW', element_type: 4, now_cost: 89, total_points: 160, event_points: 6, form: '6.0', points_per_game: '5.7', minutes: 2340, goals_scored: 15, assists: 5, clean_sheets: 6, selected_by_percent: '22.8', status: 'a', chance_of_playing_next_round: 100, position: 11, is_captain: false, is_vice_captain: false, multiplier: 1 },
  // BENCH
  { id: 170, code: 172850, web_name: 'Flekken', first_name: 'Mark', second_name: 'Flekken', team: 5, team_short_name: 'BRE', element_type: 1, now_cost: 45, total_points: 98, event_points: 2, form: '3.5', points_per_game: '3.3', minutes: 2430, goals_scored: 0, assists: 0, clean_sheets: 6, selected_by_percent: '8.2', status: 'a', chance_of_playing_next_round: 100, position: 12, is_captain: false, is_vice_captain: false, multiplier: 0 },
  { id: 220, code: 520960, web_name: 'Lewis', first_name: 'Rico', second_name: 'Lewis', team: 12, team_short_name: 'MCI', element_type: 2, now_cost: 47, total_points: 88, event_points: 1, form: '3.0', points_per_game: '3.5', minutes: 1800, goals_scored: 1, assists: 3, clean_sheets: 6, selected_by_percent: '10.5', status: 'a', chance_of_playing_next_round: 75, position: 13, is_captain: false, is_vice_captain: false, multiplier: 0 },
  { id: 505, code: 196531, web_name: 'Eze', first_name: 'Eberechi', second_name: 'Eze', team: 7, team_short_name: 'CRY', element_type: 3, now_cost: 68, total_points: 105, event_points: 3, form: '3.8', points_per_game: '4.2', minutes: 2160, goals_scored: 7, assists: 4, clean_sheets: 4, selected_by_percent: '9.1', status: 'a', chance_of_playing_next_round: 100, position: 14, is_captain: false, is_vice_captain: false, multiplier: 0 },
  { id: 490, code: 495399, web_name: 'João Pedro', first_name: 'João Pedro', second_name: 'Junqueira', team: 4, team_short_name: 'BHA', element_type: 4, now_cost: 57, total_points: 95, event_points: 2, form: '3.2', points_per_game: '3.8', minutes: 2070, goals_scored: 8, assists: 3, clean_sheets: 5, selected_by_percent: '7.6', status: 'a', chance_of_playing_next_round: 100, position: 15, is_captain: false, is_vice_captain: false, multiplier: 0 },
];

export function getDemoSquad(): SquadPlayer[] {
  return demoPlayers.map(p => ({
    ...p,
    formScore: parseFloat(p.form),
    minutesReliability: Math.min(p.minutes / 2700, 1) * 10,
    fixtureScore: 5 + Math.random() * 3, // randomized for demo
    captainScore: parseFloat(p.form) * (Math.min(p.minutes / 2700, 1) * 10) * (5 + Math.random() * 3) / 100,
  }));
}

// Demo fixtures for next 3 GWs
export const DEMO_FIXTURES: FPLFixture[] = [
  // GW 28
  { id: 271, event: 28, team_h: 1, team_a: 8, team_h_difficulty: 2, team_a_difficulty: 5, finished: false, kickoff_time: '2025-03-08T15:00:00Z' },
  { id: 272, event: 28, team_h: 11, team_a: 16, team_h_difficulty: 2, team_a_difficulty: 5, finished: false, kickoff_time: '2025-03-08T15:00:00Z' },
  { id: 273, event: 28, team_h: 6, team_a: 19, team_h_difficulty: 2, team_a_difficulty: 4, finished: false, kickoff_time: '2025-03-08T15:00:00Z' },
  { id: 274, event: 28, team_h: 12, team_a: 13, team_h_difficulty: 3, team_a_difficulty: 5, finished: false, kickoff_time: '2025-03-08T15:00:00Z' },
  { id: 275, event: 28, team_h: 14, team_a: 20, team_h_difficulty: 2, team_a_difficulty: 4, finished: false, kickoff_time: '2025-03-08T15:00:00Z' },
  { id: 276, event: 28, team_h: 5, team_a: 18, team_h_difficulty: 3, team_a_difficulty: 3, finished: false, kickoff_time: '2025-03-08T15:00:00Z' },
  { id: 277, event: 28, team_h: 17, team_a: 3, team_h_difficulty: 3, team_a_difficulty: 4, finished: false, kickoff_time: '2025-03-08T15:00:00Z' },
  { id: 278, event: 28, team_h: 15, team_a: 9, team_h_difficulty: 3, team_a_difficulty: 3, finished: false, kickoff_time: '2025-03-08T15:00:00Z' },
  { id: 279, event: 28, team_h: 7, team_a: 4, team_h_difficulty: 3, team_a_difficulty: 3, finished: false, kickoff_time: '2025-03-08T15:00:00Z' },
  { id: 280, event: 28, team_h: 10, team_a: 2, team_h_difficulty: 4, team_a_difficulty: 2, finished: false, kickoff_time: '2025-03-08T15:00:00Z' },
  // GW 29
  { id: 281, event: 29, team_h: 8, team_a: 6, team_h_difficulty: 4, team_a_difficulty: 2, finished: false, kickoff_time: '2025-03-15T15:00:00Z' },
  { id: 282, event: 29, team_h: 16, team_a: 12, team_h_difficulty: 5, team_a_difficulty: 2, finished: false, kickoff_time: '2025-03-15T15:00:00Z' },
  { id: 283, event: 29, team_h: 13, team_a: 11, team_h_difficulty: 4, team_a_difficulty: 4, finished: false, kickoff_time: '2025-03-15T15:00:00Z' },
  { id: 284, event: 29, team_h: 20, team_a: 1, team_h_difficulty: 5, team_a_difficulty: 2, finished: false, kickoff_time: '2025-03-15T15:00:00Z' },
  { id: 285, event: 29, team_h: 18, team_a: 14, team_h_difficulty: 4, team_a_difficulty: 3, finished: false, kickoff_time: '2025-03-15T15:00:00Z' },
  { id: 286, event: 29, team_h: 3, team_a: 5, team_h_difficulty: 3, team_a_difficulty: 3, finished: false, kickoff_time: '2025-03-15T15:00:00Z' },
  { id: 287, event: 29, team_h: 2, team_a: 17, team_h_difficulty: 4, team_a_difficulty: 4, finished: false, kickoff_time: '2025-03-15T15:00:00Z' },
  { id: 288, event: 29, team_h: 4, team_a: 15, team_h_difficulty: 3, team_a_difficulty: 3, finished: false, kickoff_time: '2025-03-15T15:00:00Z' },
  { id: 289, event: 29, team_h: 9, team_a: 7, team_h_difficulty: 3, team_a_difficulty: 3, finished: false, kickoff_time: '2025-03-15T15:00:00Z' },
  { id: 290, event: 29, team_h: 19, team_a: 10, team_h_difficulty: 2, team_a_difficulty: 3, finished: false, kickoff_time: '2025-03-15T15:00:00Z' },
  // GW 30
  { id: 291, event: 30, team_h: 1, team_a: 6, team_h_difficulty: 4, team_a_difficulty: 5, finished: false, kickoff_time: '2025-03-22T15:00:00Z' },
  { id: 292, event: 30, team_h: 11, team_a: 13, team_h_difficulty: 3, team_a_difficulty: 5, finished: false, kickoff_time: '2025-03-22T15:00:00Z' },
  { id: 293, event: 30, team_h: 12, team_a: 2, team_h_difficulty: 3, team_a_difficulty: 5, finished: false, kickoff_time: '2025-03-22T15:00:00Z' },
  { id: 294, event: 30, team_h: 14, team_a: 18, team_h_difficulty: 3, team_a_difficulty: 4, finished: false, kickoff_time: '2025-03-22T15:00:00Z' },
  { id: 295, event: 30, team_h: 17, team_a: 9, team_h_difficulty: 3, team_a_difficulty: 4, finished: false, kickoff_time: '2025-03-22T15:00:00Z' },
];

export const DEMO_GAMEWEEKS: FPLGameweek[] = Array.from({ length: 38 }, (_, i) => ({
  id: i + 1,
  name: `Gameweek ${i + 1}`,
  deadline_time: new Date(2024, 7, 10 + i * 7).toISOString(),
  is_current: i + 1 === 27,
  is_next: i + 1 === 28,
  finished: i + 1 < 27,
}));
