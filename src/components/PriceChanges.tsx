import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import PlayerPhoto from '@/components/PlayerPhoto';
import { SquadPlayer, POSITION_MAP, POSITION_COLORS } from '@/lib/fpl-types';

type PositionFilter = 'All' | 'GK' | 'DEF' | 'MID' | 'FWD';

interface PriceChangePlayer {
  player: SquadPlayer;
  progress: number; // -200 to 200 (percentage towards change threshold)
  prediction: 'Increase' | 'Decrease' | 'Hold';
  hourlyChange: number; // percentage
  changeTime: string;
}

function simulatePriceChanges(players: SquadPlayer[]): PriceChangePlayer[] {
  // Simulate price change data based on player stats
  return players.map(p => {
    const popularity = parseFloat(p.selected_by_percent);
    const form = parseFloat(p.form);
    // Higher form + higher ownership = more likely to rise
    const netTransferSignal = (form - 4) * 20 + (popularity - 20) * 0.5 + (Math.random() - 0.5) * 30;
    const progress = Math.max(-200, Math.min(200, netTransferSignal * 2));
    const prediction: 'Increase' | 'Decrease' | 'Hold' =
      progress > 80 ? 'Increase' : progress < -80 ? 'Decrease' : 'Hold';
    const hourlyChange = netTransferSignal * 0.01 + (Math.random() - 0.5) * 0.5;

    const hours = Math.floor(Math.random() * 48);
    const changeTime = hours < 12 ? 'Tonight' : hours < 24 ? 'Tomorrow' : `${Math.ceil(hours / 24)}d`;

    return { player: p, progress, prediction, hourlyChange, changeTime };
  }).sort((a, b) => Math.abs(b.progress) - Math.abs(a.progress));
}

interface PriceChangesProps {
  players: SquadPlayer[];
}

export default function PriceChanges({ players }: PriceChangesProps) {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<PositionFilter>('All');

  const priceData = useMemo(() => simulatePriceChanges(players), [players]);

  const filtered = useMemo(() => {
    return priceData.filter(d => {
      const matchSearch = d.player.web_name.toLowerCase().includes(search.toLowerCase()) ||
        d.player.team_short_name.toLowerCase().includes(search.toLowerCase());
      const matchPos = posFilter === 'All' || POSITION_MAP[d.player.element_type] === posFilter;
      return matchSearch && matchPos;
    });
  }, [priceData, search, posFilter]);

  const positions: PositionFilter[] = ['All', 'GK', 'DEF', 'MID', 'FWD'];

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Price Changes Predictor
          </CardTitle>
          <CardDescription>Predicted price rises and falls based on transfer activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for a player"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1">
              {positions.map(pos => (
                <button
                  key={pos}
                  onClick={() => setPosFilter(pos)}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    posFilter === pos
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 font-medium">Player</th>
                  <th className="text-center py-2 font-medium">Progress</th>
                  <th className="text-center py-2 font-medium">Price</th>
                  <th className="text-center py-2 font-medium">Prediction</th>
                  <th className="text-center py-2 font-medium">Hourly Δ</th>
                  <th className="text-center py-2 font-medium">Change Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ player, progress, prediction, hourlyChange, changeTime }) => (
                  <tr key={player.id} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <PlayerPhoto code={player.code} name={player.web_name} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{player.web_name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {player.team_short_name} • <span className={POSITION_COLORS[POSITION_MAP[player.element_type]]}>{POSITION_MAP[player.element_type]}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-24 h-3 bg-muted rounded-full overflow-hidden relative">
                          {progress > 0 ? (
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${Math.min(Math.abs(progress) / 2, 100)}%` }}
                            />
                          ) : (
                            <div
                              className="h-full bg-red-500 rounded-full transition-all ml-auto"
                              style={{ width: `${Math.min(Math.abs(progress) / 2, 100)}%` }}
                            />
                          )}
                        </div>
                        <span className={`text-[10px] font-mono ${progress > 0 ? 'text-emerald-600' : progress < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {progress > 0 ? '+' : ''}{progress.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-mono text-sm">
                      £{(player.now_cost / 10).toFixed(1)}m
                    </td>
                    <td className="py-2.5 text-center">
                      {prediction === 'Increase' ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 border-0 gap-1">
                          <TrendingUp className="w-3 h-3" /> Increase
                        </Badge>
                      ) : prediction === 'Decrease' ? (
                        <Badge className="bg-red-500/15 text-red-700 border-0 gap-1">
                          <TrendingDown className="w-3 h-3" /> Decrease
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-foreground bg-muted">Hold</Badge>
                      )}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`text-sm font-mono ${hourlyChange > 0 ? 'text-emerald-600' : hourlyChange < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {hourlyChange > 0 ? '+' : ''}{hourlyChange.toFixed(2)}%
                        {hourlyChange > 0 ? <TrendingUp className="w-3 h-3 inline ml-1" /> : hourlyChange < 0 ? <TrendingDown className="w-3 h-3 inline ml-1" /> : null}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      {changeTime === 'Tonight' || changeTime === 'Tomorrow' ? (
                        <span className="flex items-center justify-center gap-1 text-xs">
                          <AlertTriangle className="w-3 h-3 text-amber-500" /> {changeTime}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{changeTime}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">No players found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            <AlertTriangle className="inline w-3 h-3 mr-1" />
            Predictions are based on simulated transfer activity. Actual price changes are determined by the FPL algorithm.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
