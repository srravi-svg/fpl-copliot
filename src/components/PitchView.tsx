import React from 'react';
import { SquadPlayer, POSITION_MAP, FixturePreview } from '@/lib/fpl-types';
import { getFDRColor } from '@/lib/fpl-metrics';
import PlayerPhoto from '@/components/PlayerPhoto';

interface PitchViewProps {
  starting: SquadPlayer[];
  bench: SquadPlayer[];
  getNextFixture: (player: SquadPlayer) => FixturePreview | null;
}

function PlayerCard({ player, fix, isBench = false }: { player: SquadPlayer; fix: FixturePreview | null; isBench?: boolean }) {
  return (
    <div className="flex flex-col items-center w-[72px] sm:w-[85px]">
      {/* Jersey / Photo */}
      <div className="relative">
        <PlayerPhoto code={player.code} name={player.web_name} size="lg" />
        {player.is_captain && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow">
            <span className="text-[9px] font-bold text-black">C</span>
          </div>
        )}
        {player.is_vice_captain && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center shadow">
            <span className="text-[9px] font-bold text-black">V</span>
          </div>
        )}
      </div>
      {/* Name label */}
      <div className={`mt-1 w-full text-center text-[10px] sm:text-[11px] font-semibold px-1 py-0.5 truncate rounded-t ${isBench ? 'bg-muted text-foreground' : 'bg-white text-gray-900'}`}>
        {player.web_name}
      </div>
      {/* Fixture label */}
      {fix ? (
        <div className={`w-full text-center text-[9px] sm:text-[10px] font-medium px-1 py-0.5 truncate ${isBench ? 'bg-muted/80 text-muted-foreground rounded-b' : 'bg-gray-100 text-gray-700 rounded-b'}`}>
          {fix.opponent} ({fix.isHome ? 'H' : 'A'})
        </div>
      ) : (
        <div className={`w-full text-center text-[9px] px-1 py-0.5 rounded-b ${isBench ? 'bg-muted/80 text-muted-foreground' : 'bg-gray-100 text-gray-500'}`}>—</div>
      )}
      {/* Expected points */}
      <div className="mt-0.5 bg-fpl-purple text-fpl-green text-[10px] font-bold px-2 py-0.5 rounded-full">
        {player.captainScore.toFixed(1)} xPts
      </div>
    </div>
  );
}

export default function PitchView({ starting, bench, getNextFixture }: PitchViewProps) {
  const gks = starting.filter(p => p.element_type === 1);
  const defs = starting.filter(p => p.element_type === 2);
  const mids = starting.filter(p => p.element_type === 3);
  const fwds = starting.filter(p => p.element_type === 4);

  const rows = [fwds, mids, defs, gks];

  return (
    <div className="space-y-0">
      {/* Pitch */}
      <div className="relative rounded-t-xl overflow-hidden bg-gradient-to-b from-emerald-600 via-emerald-500 to-emerald-600">
        {/* Pitch markings */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Centre circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-white/20" />
          {/* Halfway line */}
          <div className="absolute top-1/2 left-4 right-4 h-px bg-white/15" />
          {/* Top penalty box */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-16 sm:h-20 border-2 border-t-0 border-white/15 rounded-b-md" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-8 sm:h-10 border-2 border-t-0 border-white/15 rounded-b-sm" />
          {/* Bottom penalty box */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-16 sm:h-20 border-2 border-b-0 border-white/15 rounded-t-md" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-8 sm:h-10 border-2 border-b-0 border-white/15 rounded-t-sm" />
          {/* Alternating grass stripes */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="absolute left-0 right-0 bg-white/[0.03]" style={{ top: `${i * 20}%`, height: '10%' }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col gap-6 sm:gap-8 py-5 sm:py-7 px-2">
          {rows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-2 sm:gap-4">
              {row.map(player => {
                const fix = getNextFixture(player);
                return <PlayerCard key={player.id} player={player} fix={fix} />;
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bench */}
      <div className="bg-muted/70 rounded-b-xl p-3 pt-2 border-t-2 border-emerald-800/30">
        <div className="flex justify-center gap-2 sm:gap-3 mb-2">
          {bench.map((player, i) => {
            const posLabel = i === 0 ? 'GKP' : `${i}. ${POSITION_MAP[player.element_type]}`;
            return (
              <div key={player.id} className="flex flex-col items-center w-[72px] sm:w-[85px]">
                <span className="text-[9px] font-semibold text-muted-foreground mb-1">{posLabel}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-2 sm:gap-3">
          {bench.map(player => {
            const fix = getNextFixture(player);
            return <PlayerCard key={player.id} player={player} fix={fix} isBench />;
          })}
        </div>
      </div>
    </div>
  );
}