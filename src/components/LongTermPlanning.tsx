import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, ArrowRightLeft, Plus, Trash2, Eye, ChevronRight } from 'lucide-react';
import PlayerPhoto from '@/components/PlayerPhoto';
import { SquadPlayer, FPLPlayer, POSITION_MAP, POSITION_COLORS } from '@/lib/fpl-types';
import { getFDRColor, getFixturePreviews } from '@/lib/fpl-metrics';
import { DEMO_TEAMS, DEMO_FIXTURES } from '@/lib/demo-data';

interface PlannedTransfer {
  id: string;
  gameweek: number;
  out: SquadPlayer;
  in: SquadPlayer | null; // null when not yet selected
}

interface LongTermPlanningProps {
  squad: {
    players: SquadPlayer[];
    gameweek: number;
    bank: number;
  };
  allPlayers: FPLPlayer[];
}

export default function LongTermPlanning({ squad, allPlayers }: LongTermPlanningProps) {
  const [plannedTransfers, setPlannedTransfers] = useState<PlannedTransfer[]>([]);
  const [selectedGw, setSelectedGw] = useState(squad.gameweek);
  const [previewGw, setPreviewGw] = useState<number | null>(null);

  const futureGws = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => squad.gameweek + i);
  }, [squad.gameweek]);

  const squadIds = useMemo(() => new Set(squad.players.map(p => p.id)), [squad.players]);

  const getSquadAtGw = (targetGw: number): SquadPlayer[] => {
    let currentSquad = [...squad.players];
    for (const t of plannedTransfers) {
      if (t.gameweek <= targetGw && t.in) {
        currentSquad = currentSquad.filter(p => p.id !== t.out.id);
        currentSquad.push(t.in as SquadPlayer);
      }
    }
    return currentSquad;
  };

  const previewSquad = previewGw !== null ? getSquadAtGw(previewGw) : null;

  const addTransfer = (gw: number, playerOut: SquadPlayer) => {
    setPlannedTransfers(prev => [
      ...prev,
      { id: `${Date.now()}`, gameweek: gw, out: playerOut, in: null },
    ]);
  };

  const setTransferIn = (transferId: string, playerIn: SquadPlayer) => {
    setPlannedTransfers(prev =>
      prev.map(t => t.id === transferId ? { ...t, in: playerIn } : t)
    );
  };

  const removeTransfer = (transferId: string) => {
    setPlannedTransfers(prev => prev.filter(t => t.id !== transferId));
  };

  const transfersByGw = useMemo(() => {
    const grouped: Record<number, PlannedTransfer[]> = {};
    for (const t of plannedTransfers) {
      if (!grouped[t.gameweek]) grouped[t.gameweek] = [];
      grouped[t.gameweek].push(t);
    }
    return grouped;
  }, [plannedTransfers]);

  const currentSquadForGw = getSquadAtGw(selectedGw - 1);
  const availablePlayersOut = currentSquadForGw.filter(
    p => !plannedTransfers.some(t => t.gameweek === selectedGw && t.out.id === p.id)
  );

  // Get replacement candidates for a position
  const getCandidates = (elementType: number, budget: number) => {
    const currentIds = new Set(getSquadAtGw(selectedGw - 1).map(p => p.id));
    return (allPlayers as unknown as SquadPlayer[])
      .filter(p => p.element_type === elementType && p.now_cost <= budget && !currentIds.has(p.id) && p.status === 'a')
      .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))
      .slice(0, 8);
  };

  const totalHits = useMemo(() => {
    let hits = 0;
    const gwCounts: Record<number, number> = {};
    for (const t of plannedTransfers) {
      gwCounts[t.gameweek] = (gwCounts[t.gameweek] || 0) + 1;
    }
    for (const count of Object.values(gwCounts)) {
      if (count > 1) hits += (count - 1) * 4;
    }
    return hits;
  }, [plannedTransfers]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <CalendarDays className="w-5 h-5" /> Long Term Transfer Planner
          </CardTitle>
          <CardDescription>
            Plan transfers across multiple gameweeks to visualize your squad's evolution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* GW Timeline */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {futureGws.map(gw => {
              const gwTransfers = transfersByGw[gw] || [];
              const isSelected = selectedGw === gw;
              return (
                <button
                  key={gw}
                  onClick={() => setSelectedGw(gw)}
                  className={`flex flex-col items-center min-w-[72px] px-3 py-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-xs font-semibold">GW{gw}</span>
                  {gwTransfers.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] mt-1 px-1.5">
                      {gwTransfers.length} {gwTransfers.length === 1 ? 'move' : 'moves'}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add Transfer for Selected GW */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">GW{selectedGw} Transfers</p>
              <div className="flex items-center gap-2">
                {totalHits > 0 && (
                  <Badge variant="destructive" className="text-xs">-{totalHits} pts hits</Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewGw(previewGw === selectedGw ? null : selectedGw)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  {previewGw === selectedGw ? 'Hide Preview' : 'Preview Squad'}
                </Button>
              </div>
            </div>

            {/* Planned transfers for this GW */}
            <div className="space-y-2 mb-3">
              {(transfersByGw[selectedGw] || []).map(transfer => (
                <div key={transfer.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-accent/20">
                  {/* OUT */}
                  <div className="flex items-center gap-2 flex-1">
                    <Badge variant="destructive" className="text-[10px]">OUT</Badge>
                    <PlayerPhoto code={transfer.out.code} name={transfer.out.web_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{transfer.out.web_name}</p>
                      <p className="text-[10px] text-muted-foreground">{transfer.out.team_short_name} • £{(transfer.out.now_cost / 10).toFixed(1)}</p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground" />

                  {/* IN */}
                  <div className="flex items-center gap-2 flex-1">
                    {transfer.in ? (
                      <>
                        <Badge className="bg-emerald-500/20 text-emerald-700 border-0 text-[10px]">IN</Badge>
                        <PlayerPhoto code={transfer.in.code} name={transfer.in.web_name} size="sm" />
                        <div>
                          <p className="text-sm font-medium">{transfer.in.web_name}</p>
                          <p className="text-[10px] text-muted-foreground">{transfer.in.team_short_name} • £{(transfer.in.now_cost / 10).toFixed(1)}</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        <Select onValueChange={(val) => {
                          const player = (allPlayers as unknown as SquadPlayer[]).find(p => p.id === parseInt(val));
                          if (player) setTransferIn(transfer.id, player);
                        }}>
                          <SelectTrigger className="w-40 h-8 text-xs">
                            <SelectValue placeholder="Select replacement" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {getCandidates(transfer.out.element_type, transfer.out.now_cost + (squad.bank || 0)).map(c => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.web_name} (£{(c.now_cost / 10).toFixed(1)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeTransfer(transfer.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new transfer button with player selection */}
            <Select onValueChange={(val) => {
              const player = availablePlayersOut.find(p => p.id === parseInt(val));
              if (player) addTransfer(selectedGw, player);
            }}>
              <SelectTrigger className="w-full border-dashed">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add transfer — select player to remove</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {availablePlayersOut.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    <span className={`text-[10px] mr-1 ${POSITION_COLORS[POSITION_MAP[p.element_type]]}`}>
                      {POSITION_MAP[p.element_type]}
                    </span>
                    {p.web_name} ({p.team_short_name} • £{(p.now_cost / 10).toFixed(1)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Squad */}
          {previewSquad && previewGw !== null && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Squad after GW{previewGw} transfers</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['GK', 'DEF', 'MID', 'FWD'].map(pos => {
                  const posPlayers = previewSquad.filter(p => POSITION_MAP[p.element_type] === pos);
                  return (
                    <div key={pos}>
                      <p className={`text-xs font-semibold mb-1 ${POSITION_COLORS[pos as keyof typeof POSITION_COLORS]}`}>{pos}</p>
                      {posPlayers.map(p => {
                        const isNew = !squadIds.has(p.id);
                        return (
                          <div key={p.id} className={`flex items-center gap-2 py-1 px-2 rounded text-sm ${isNew ? 'bg-emerald-500/10' : ''}`}>
                            <PlayerPhoto code={p.code} name={p.web_name} size="sm" />
                            <span className={`font-medium ${isNew ? 'text-emerald-700' : ''}`}>{p.web_name}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">£{(p.now_cost / 10).toFixed(1)}</span>
                            {isNew && <Badge className="bg-emerald-500/20 text-emerald-700 border-0 text-[8px] px-1">NEW</Badge>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
