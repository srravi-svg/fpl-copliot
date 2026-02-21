import React from 'react';
import { SquadPlayer, POSITION_MAP, getPlayerPhotoUrl } from '@/lib/fpl-types';
import { FixturePreview } from '@/lib/fpl-types';
import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getFDRColor } from '@/lib/fpl-metrics';
import PlayerPhoto from '@/components/PlayerPhoto';

interface PitchViewProps {
  players: SquadPlayer[];
  getNextFixture: (player: SquadPlayer) => FixturePreview | null;
}

export default function PitchView({ players, getNextFixture }: PitchViewProps) {
  const starters = players.filter(p => p.position <= 11);
  const bench = players.filter(p => p.position > 11);

  const gks = starters.filter(p => p.element_type === 1);
  const defs = starters.filter(p => p.element_type === 2);
  const mids = starters.filter(p => p.element_type === 3);
  const fwds = starters.filter(p => p.element_type === 4);

  const rows = [fwds, mids, defs, gks]; // top to bottom on pitch

  return (
    <div className="space-y-2">
      {/* Pitch */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-emerald-700 via-emerald-600 to-emerald-700 p-3">
        {/* Pitch markings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 rounded-full border-2 border-white/15" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-10 border-2 border-t-0 border-white/15 rounded-b-lg" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-10 border-2 border-b-0 border-white/15 rounded-t-lg" />
        {/* Halfway line */}
        <div className="absolute top-1/2 left-2 right-2 h-px bg-white/10" />

        <div className="relative z-10 flex flex-col gap-3 py-2">
          {rows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-2">
              {row.map(player => {
                const fix = getNextFixture(player);
                return (
                  <div key={player.id} className="flex flex-col items-center w-16">
                    <div className="relative">
                      <PlayerPhoto code={player.code} name={player.web_name} size="sm" />
                      {player.is_captain && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-black">C</span>
                        </div>
                      )}
                      {player.is_vice_captain && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-black">V</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-1 bg-primary text-primary-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded text-center w-full truncate">
                      {player.web_name}
                    </div>
                    {fix && (
                      <Badge className={`text-[8px] px-1 py-0 mt-0.5 ${getFDRColor(fix.difficulty)}`}>
                        {fix.opponent} ({fix.isHome ? 'H' : 'A'})
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bench */}
      <div className="bg-muted/50 rounded-lg p-2">
        <p className="text-[10px] font-semibold text-muted-foreground mb-2 text-center">SUBSTITUTES</p>
        <div className="flex justify-center gap-2">
          {bench.map(player => {
            const fix = getNextFixture(player);
            return (
              <div key={player.id} className="flex flex-col items-center w-16">
                <PlayerPhoto code={player.code} name={player.web_name} size="sm" />
                <div className="mt-1 bg-muted text-muted-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded text-center w-full truncate">
                  {player.web_name}
                </div>
                {fix && (
                  <Badge className={`text-[8px] px-1 py-0 mt-0.5 ${getFDRColor(fix.difficulty)}`}>
                    {fix.opponent} ({fix.isHome ? 'H' : 'A'})
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
