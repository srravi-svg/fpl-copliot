import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Search, GitCompareArrows, X } from 'lucide-react';
import { DEMO_TEAMS, getDemoSquad, DEMO_FIXTURES } from '@/lib/demo-data';
import { POSITION_MAP, POSITION_COLORS, FPLPlayer } from '@/lib/fpl-types';
import { getFixturePreviews, getFDRColor } from '@/lib/fpl-metrics';

// Generate a larger pool of players for the explorer
function getAllPlayers(): FPLPlayer[] {
  const squad = getDemoSquad();
  const extraPlayers: Omit<FPLPlayer, 'formScore' | 'minutesReliability' | 'fixtureScore' | 'captainScore'>[] = [
    { id: 100, web_name: 'Watkins', first_name: 'Ollie', second_name: 'Watkins', team: 2, team_short_name: 'AVL', element_type: 4, now_cost: 88, total_points: 150, event_points: 5, form: '5.5', points_per_game: '5.0', minutes: 2520, goals_scored: 14, assists: 8, clean_sheets: 5, selected_by_percent: '20.1', status: 'a', chance_of_playing_next_round: 100 },
    { id: 101, web_name: 'Son', first_name: 'Heung-min', second_name: 'Son', team: 17, team_short_name: 'TOT', element_type: 3, now_cost: 98, total_points: 148, event_points: 7, form: '5.8', points_per_game: '5.3', minutes: 2430, goals_scored: 12, assists: 9, clean_sheets: 5, selected_by_percent: '16.4', status: 'a', chance_of_playing_next_round: 100 },
    { id: 102, web_name: 'Gordon', first_name: 'Anthony', second_name: 'Gordon', team: 14, team_short_name: 'NEW', element_type: 3, now_cost: 75, total_points: 135, event_points: 6, form: '5.2', points_per_game: '4.8', minutes: 2340, goals_scored: 9, assists: 7, clean_sheets: 6, selected_by_percent: '14.8', status: 'a', chance_of_playing_next_round: 100 },
    { id: 103, web_name: 'Cunha', first_name: 'Matheus', second_name: 'Cunha', team: 20, team_short_name: 'WOL', element_type: 4, now_cost: 72, total_points: 128, event_points: 4, form: '4.8', points_per_game: '4.6', minutes: 2250, goals_scored: 11, assists: 5, clean_sheets: 3, selected_by_percent: '12.3', status: 'a', chance_of_playing_next_round: 100 },
    { id: 104, web_name: 'Pickford', first_name: 'Jordan', second_name: 'Pickford', team: 8, team_short_name: 'EVE', element_type: 1, now_cost: 49, total_points: 110, event_points: 2, form: '3.8', points_per_game: '3.7', minutes: 2700, goals_scored: 0, assists: 0, clean_sheets: 8, selected_by_percent: '11.2', status: 'a', chance_of_playing_next_round: 100 },
    { id: 105, web_name: 'Bruno', first_name: 'Bruno', second_name: 'Fernandes', team: 13, team_short_name: 'MUN', element_type: 3, now_cost: 84, total_points: 125, event_points: 3, form: '4.2', points_per_game: '4.5', minutes: 2610, goals_scored: 7, assists: 8, clean_sheets: 5, selected_by_percent: '13.5', status: 'a', chance_of_playing_next_round: 100 },
    { id: 106, web_name: 'Diaz', first_name: 'Luis', second_name: 'Diaz', team: 11, team_short_name: 'LIV', element_type: 3, now_cost: 79, total_points: 140, event_points: 8, form: '6.0', points_per_game: '5.0', minutes: 2340, goals_scored: 10, assists: 6, clean_sheets: 9, selected_by_percent: '19.5', status: 'a', chance_of_playing_next_round: 100 },
    { id: 107, web_name: 'Gabriel', first_name: 'Gabriel', second_name: 'Magalhães', team: 1, team_short_name: 'ARS', element_type: 2, now_cost: 62, total_points: 138, event_points: 6, form: '4.8', points_per_game: '4.6', minutes: 2610, goals_scored: 4, assists: 1, clean_sheets: 12, selected_by_percent: '18.7', status: 'a', chance_of_playing_next_round: 100 },
  ];

  const allRaw = [
    ...squad,
    ...extraPlayers.map(p => ({
      ...p,
      formScore: parseFloat(p.form),
      minutesReliability: Math.min(p.minutes / 2700, 1) * 10,
      fixtureScore: 5 + Math.random() * 3,
      captainScore: 0,
    })),
  ];

  return allRaw.map(p => ({
    ...p,
    captainScore: p.formScore * p.fixtureScore * p.minutesReliability / 100,
  }));
}

export default function PlayerExplorer() {
  const [search, setSearch] = useState('');
  const [compareIds, setCompareIds] = useState<number[]>([]);

  const players = useMemo(() => getAllPlayers(), []);
  const teams = DEMO_TEAMS;
  const fixtures = DEMO_FIXTURES;

  const filtered = useMemo(() => {
    if (!search.trim()) return players;
    const q = search.toLowerCase();
    return players.filter(p =>
      p.web_name.toLowerCase().includes(q) ||
      p.team_short_name.toLowerCase().includes(q) ||
      POSITION_MAP[p.element_type].toLowerCase().includes(q)
    );
  }, [search, players]);

  const comparePlayers = compareIds.map(id => players.find(p => p.id === id)).filter(Boolean) as FPLPlayer[];

  const toggleCompare = (id: number) => {
    setCompareIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-display font-bold">Player Explorer</h1>
            <p className="text-xs text-muted-foreground">{players.length} players</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players, teams, positions..."
              className="pl-9"
            />
          </div>
          {compareIds.length > 0 && (
            <Button variant="outline" onClick={() => setCompareIds([])}>
              <X className="w-4 h-4 mr-1" /> Clear Compare
            </Button>
          )}
        </div>

        {/* Compare View */}
        {comparePlayers.length === 2 && (
          <Card className="mb-6 border-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <GitCompareArrows className="w-4 h-4" /> Player Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div />
                {comparePlayers.map(p => (
                  <div key={p.id} className="text-center font-semibold">
                    {p.web_name}
                    <p className="text-xs text-muted-foreground font-normal">{p.team_short_name} • {POSITION_MAP[p.element_type]}</p>
                  </div>
                ))}
                {[
                  { label: 'Price', fn: (p: FPLPlayer) => `£${(p.now_cost / 10).toFixed(1)}` },
                  { label: 'Total Points', fn: (p: FPLPlayer) => p.total_points },
                  { label: 'Form', fn: (p: FPLPlayer) => p.formScore.toFixed(1) },
                  { label: 'Minutes', fn: (p: FPLPlayer) => p.minutes },
                  { label: 'Goals', fn: (p: FPLPlayer) => p.goals_scored },
                  { label: 'Assists', fn: (p: FPLPlayer) => p.assists },
                  { label: 'Fixture Score', fn: (p: FPLPlayer) => p.fixtureScore.toFixed(1) },
                  { label: 'Captain Score', fn: (p: FPLPlayer) => p.captainScore.toFixed(2) },
                ].map(({ label, fn }) => (
                  <React.Fragment key={label}>
                    <div className="text-muted-foreground">{label}</div>
                    {comparePlayers.map(p => {
                      const val = fn(p);
                      const otherVal = fn(comparePlayers.find(x => x.id !== p.id)!);
                      const isBetter = typeof val === 'number' ? val > (otherVal as number) : false;
                      return (
                        <div key={p.id} className={`text-center font-mono ${isBetter ? 'text-emerald-600 font-bold' : ''}`}>
                          {val}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Player Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Player</TableHead>
                <TableHead>Pos</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Pts</TableHead>
                <TableHead className="text-right">Form</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead>Next 3 Fixtures</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(player => {
                const pos = POSITION_MAP[player.element_type];
                const previews = getFixturePreviews(player, fixtures, teams, 27, 3);
                const isComparing = compareIds.includes(player.id);
                return (
                  <TableRow key={player.id} className={isComparing ? 'bg-accent/50' : ''}>
                    <TableCell>
                      <button
                        onClick={() => toggleCompare(player.id)}
                        className={`w-6 h-6 rounded border flex items-center justify-center text-xs transition-colors ${
                          isComparing ? 'bg-secondary text-secondary-foreground border-secondary' : 'border-border hover:border-secondary'
                        }`}
                      >
                        {isComparing ? '✓' : <GitCompareArrows className="w-3 h-3" />}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{player.web_name}</p>
                        <p className="text-xs text-muted-foreground">{player.team_short_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${POSITION_COLORS[pos]}`}>{pos}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">£{(player.now_cost / 10).toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{player.total_points}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{player.formScore.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{player.minutes}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {previews.map((f, i) => (
                          <Badge key={i} className={`text-[10px] px-1.5 ${getFDRColor(f.difficulty)}`}>
                            {f.isHome ? '' : '@'}{f.opponent}
                          </Badge>
                        ))}
                        {previews.length === 0 && <span className="text-xs text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
