import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Zap, Users, Brain, TrendingUp, Shield, Target } from 'lucide-react';
import { createDemoSquad, saveSquad, getDemoData } from '@/lib/fpl-store';
import { fetchBootstrapData, fetchFixtures, fetchSquadPicks } from '@/lib/fpl-api';
import { enrichPlayers } from '@/lib/fpl-metrics';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [teamId, setTeamId] = useState('');
  const [gameweek, setGameweek] = useState('');
  const [detectedGw, setDetectedGw] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLoadSquad = async () => {
    if (!teamId.trim()) {
      setError('Please enter your FPL Team ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [bootstrap, fixtures] = await Promise.all([
        fetchBootstrapData(),
        fetchFixtures(),
      ]);

      // Auto-detect current/latest finished gameweek if not manually set
      let gw = gameweek ? parseInt(gameweek) : 0;
      if (!gw) {
        const current = bootstrap.gameweeks.find((g) => g.is_current);
        const next = bootstrap.gameweeks.find((g) => g.is_next);
        const lastFinished = [...bootstrap.gameweeks].reverse().find((g) => g.finished);
        gw = current?.id ?? lastFinished?.id ?? next ? (next!.id - 1) : 1;
      }
      setGameweek(String(gw));
      setDetectedGw(gw);

      const enriched = enrichPlayers(bootstrap.players, fixtures, bootstrap.teams, gw);
      const { players: picks, bank } = await fetchSquadPicks(parseInt(teamId), gw, enriched);

      const squad = {
        teamId: parseInt(teamId),
        players: picks,
        gameweek: gw,
        bank,
        isDemo: false,
        lastRefreshed: new Date().toISOString(),
      };

      saveSquad(squad);
      localStorage.setItem('fpl-data', JSON.stringify({
        players: enriched,
        teams: bootstrap.teams,
        fixtures,
        gameweeks: bootstrap.gameweeks,
      }));

      toast({ title: 'Squad loaded!', description: `Loaded ${picks.length} players for GW${gw}` });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to load squad:', err);
      setError(err.message || 'Failed to load squad. Try the demo squad instead.');
      toast({
        title: 'API Error',
        description: 'Could not reach FPL servers. Try using the demo squad.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSquad = () => {
    const gw = parseInt(gameweek);
    const squad = createDemoSquad(gw);
    saveSquad(squad);
    toast({ title: 'Demo squad loaded!', description: '15 players ready for analysis' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered FPL Decisions</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground mb-6 tracking-tight">
              FPL Copilot
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto">
              Your AI-powered weekly decision assistant for Fantasy Premier League.
              Get captain picks, lineup advice, and transfer suggestions backed by data.
            </p>

            {/* Setup Card */}
            <Card className="max-w-lg mx-auto border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-display">Get Started</CardTitle>
                <CardDescription>Enter your FPL Team ID or use our demo squad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="FPL Team ID (e.g. 12345)"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="text-center text-lg"
                  />
                </div>

                <Select value={gameweek || "auto"} onValueChange={(v) => setGameweek(v === "auto" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-detect Gameweek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect (latest)</SelectItem>
                    {Array.from({ length: 38 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        Gameweek {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleLoadSquad}
                    disabled={isLoading}
                    className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load My Squad'
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDemoSquad}
                    className="w-full h-12 text-base border-secondary text-secondary hover:bg-secondary/10"
                  >
                    <Users className="w-4 h-4" />
                    Use Demo Squad
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: Target,
              title: 'Captain Picks',
              desc: 'AI-ranked captain choices with confidence scores and fixture analysis',
            },
            {
              icon: Shield,
              title: 'Lineup Optimizer',
              desc: 'Optimal starting XI and bench order based on form, minutes, and fixtures',
            },
            {
              icon: Brain,
              title: 'AI Chat',
              desc: 'Ask any FPL question and get personalized, data-driven advice',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent text-accent-foreground mb-4">
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
