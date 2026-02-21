import React from 'react';
import { SquadPlayer, POSITION_MAP, FixturePreview } from '@/lib/fpl-types';
import { Badge } from '@/components/ui/badge';
import { getFDRColor } from '@/lib/fpl-metrics';
import PlayerPhoto from '@/components/PlayerPhoto';

interface PitchViewProps {
  starting: SquadPlayer[];
  bench: SquadPlayer[];
  getNextFixture: (player: SquadPlayer) => FixturePreview | null;
}

export default function PitchView({ starting, bench, getNextFixture }: PitchViewProps) {
  const gks = starting.filter(p => p.element_type === 1);
  const defs = starting.filter(p => p.element_type === 2);
  const mids = starting.filter(p => p.element_type === 3);
  const fwds = starting.filter(p => p.element_type === 4);

  const rows = [fwds, mids, defs, gks]; // top to bottom on pitch

  return (
    <div className="space-y-3">
      {/* Pitch */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-emerald-700 via-emerald-600 to-emerald-700 p-5">
        {/* Pitch markings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full border-2 border-white/15" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-14 border-2 border-t-0 border-white/15 rounded-b-lg" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-14 border-2 border-b-0 border-white/15 rounded-t-lg" />
        <div className="absolute top-1/2 left-3 right-3 h-px bg-white/10" />

        <div className="relative z-10 flex flex-col gap-5 py-3">
          {rows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-3">
              {row.map(player => {
                const fix = getNextFixture(player);
                return (
                  <div key={player.id} className="flex flex-col items-center w-20">
                    <div className="relative">
                      <PlayerPhoto code={player.code} name={player.web_name} size="md" />
                      {player.is_captain && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-black">C</span>
                        </div>
                      )}
                      {player.is_vice_captain && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-black">V</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5 bg-primary text-primary-foreground text-[11px] font-semibold px-2 py-0.5 rounded text-center w-full truncate">
                      {player.web_name}
                    </div>
                    <div className="text-[10px] font-mono text-white/90 mt-0.5">
                      xPts: {player.captainScore.toFixed(1)}
                    </div>
                    {fix && (
                      <Badge className={`text-[9px] px-1.5 py-0 mt-0.5 ${getFDRColor(fix.difficulty)}`}>
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
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-[11px] font-semibold text-muted-foreground mb-2 text-center">SUBSTITUTES</p>
        <div className="flex justify-center gap-3">
          {bench.map(player => {
            const fix = getNextFixture(player);
            return (
              <div key={player.id} className="flex flex-col items-center w-20">
                <PlayerPhoto code={player.code} name={player.web_name} size="md" />
                <div className="mt-1.5 bg-muted text-muted-foreground text-[11px] font-semibold px-2 py-0.5 rounded text-center w-full truncate">
                  {player.web_name}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  xPts: {player.captainScore.toFixed(1)}
                </div>
                {fix && (
                  <Badge className={`text-[9px] px-1.5 py-0 mt-0.5 ${getFDRColor(fix.difficulty)}`}>
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
