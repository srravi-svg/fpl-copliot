import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, RefreshCw, Crown, Users, ArrowRightLeft, Send, Bot, User,
  TrendingUp, Shield, Clock, AlertTriangle, Home, Plane, Sparkles, Search
} from 'lucide-react';
import { loadSquad, createDemoSquad, saveSquad, getDemoData } from '@/lib/fpl-store';
import { UserSquad, SquadPlayer, POSITION_MAP, POSITION_COLORS, FixturePreview, ChatMessage, getPlayerPhotoUrl } from '@/lib/fpl-types';
import PlayerPhoto from '@/components/PlayerPhoto';
import { generateCaptainRec, generateStartingXI, getFixturePreviews, getFDRColor } from '@/lib/fpl-metrics';
import { DEMO_TEAMS, DEMO_FIXTURES } from '@/lib/demo-data';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fpl-chat`;

const SAMPLE_QUESTIONS = [
  "Who should I captain this GW?",
  "Is a -4 worth it?",
  "Who should I bench?",
  "Suggest 1 safe transfer and explain.",
];

function buildSquadContext(squad: UserSquad): string {
  const byPos = { GK: [] as string[], DEF: [] as string[], MID: [] as string[], FWD: [] as string[] };
  squad.players.forEach(p => {
    const pos = POSITION_MAP[p.element_type];
    const label = `${p.web_name} (${p.team_short_name}, £${(p.now_cost / 10).toFixed(1)}, form: ${p.formScore.toFixed(1)}, pts: ${p.total_points})${p.is_captain ? ' [C]' : ''}${p.is_vice_captain ? ' [VC]' : ''}${p.position > 11 ? ' [BENCH]' : ''}`;
    byPos[pos].push(label);
  });

  return `Gameweek: ${squad.gameweek}\nSquad (${squad.isDemo ? 'Demo' : 'Real'}):\n${Object.entries(byPos).map(([pos, players]) => `${pos}: ${players.join(', ')}`).join('\n')}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [squad, setSquad] = useState<UserSquad | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [allowHit, setAllowHit] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadSquad();
    if (!saved) {
      const demo = createDemoSquad(28);
      saveSquad(demo);
      setSquad(demo);
    } else {
      setSquad(saved);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!squad) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="w-96 h-48" />
      </div>
    );
  }

  const captainPicks = generateCaptainRec(squad.players);
  const { starting, bench } = generateStartingXI(squad.players);
  const teams = DEMO_TEAMS;
  const fixtures = DEMO_FIXTURES;

  const groupedPlayers = squad.players.reduce((acc, p) => {
    const pos = POSITION_MAP[p.element_type];
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(p);
    return acc;
  }, {} as Record<string, SquadPlayer[]>);

  const getNextFixture = (player: SquadPlayer): FixturePreview | null => {
    const previews = getFixturePreviews(player, fixtures, teams, squad.gameweek - 1, 1);
    return previews[0] ?? null;
  };

  async function sendChat(message: string) {
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map(m => ({ role: m.role, content: m.content })),
          squadContext: buildSquadContext(squad),
        }),
      });

      if (resp.status === 429 || resp.status === 402) {
        const err = await resp.json();
        toast({ title: 'AI Limit', description: err.error, variant: 'destructive' });
        fallbackResponse(message);
        return;
      }

      if (!resp.ok || !resp.body) {
        fallbackResponse(message);
        return;
      }

      // Stream response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantSoFar = '';
      const assistantId = (Date.now() + 1).toString();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setChatMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.id === assistantId) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { id: assistantId, role: 'assistant', content: assistantSoFar, timestamp: new Date() }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (!assistantSoFar) {
        fallbackResponse(message);
      }
    } catch {
      fallbackResponse(message);
    } finally {
      setIsChatLoading(false);
    }
  }

  function fallbackResponse(question: string) {
    setIsOfflineMode(true);
    const q = question.toLowerCase();
    let answer = '';

    if (q.includes('captain')) {
      const picks = captainPicks;
      answer = `**Captain Recommendation (Offline Mode)**\n\n1. **${picks[0]?.web_name}** — Best form + fixtures combo (Form: ${picks[0]?.formScore.toFixed(1)})\n2. **${picks[1]?.web_name}** — Strong alternative\n3. **${picks[2]?.web_name}** — Differential pick\n\n*Ask me about specific matchups for more detail!*`;
    } else if (q.includes('bench')) {
      answer = `**Bench Order (Offline Mode)**\n\n${bench.map((p, i) => `${i + 1}. **${p.web_name}** (${POSITION_MAP[p.element_type]}) — Form: ${p.formScore.toFixed(1)}`).join('\n')}\n\n*Based on current form and fixture difficulty.*`;
    } else if (q.includes('transfer') || q.includes('-4')) {
      answer = `**Transfer Advice (Offline Mode)**\n\nLooking at your squad's weakest links by form + fixtures:\n- Consider upgrading your lowest-form starter\n- ${allowHit ? 'With a -4 hit, you could address two problem positions' : 'A single free transfer is usually safest'}\n\n*Toggle "Allow -4 hit" for aggressive options.*`;
    } else {
      answer = `I'm currently in **Offline Mode** — the AI service is temporarily unavailable.\n\nI can still help with:\n- Captain picks based on form & fixtures\n- Bench order recommendations\n- Basic transfer advice\n\n*Try one of the quick question chips above!*`;
    }

    setChatMessages(prev => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: 'assistant', content: answer, timestamp: new Date() },
    ]);
    setIsChatLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-xl font-display font-bold">FPL Copilot</h1>
              <p className="text-xs text-muted-foreground">
                GW{squad.gameweek} • {squad.isDemo ? 'Demo Squad' : `Team #${squad.teamId}`}
                {isOfflineMode && <Badge variant="secondary" className="ml-2 text-xs">Offline Mode</Badge>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch id="hit-toggle" checked={allowHit} onCheckedChange={setAllowHit} />
              <Label htmlFor="hit-toggle" className="text-xs">Allow -4</Label>
            </div>
            <Link to="/explorer">
              <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-1" /> Players</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => toast({ title: 'Data refreshed' })}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left: Squad Overview */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Users className="w-4 h-4" /> Squad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['GK', 'DEF', 'MID', 'FWD'] as const).map(pos => (
                  <div key={pos}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">{pos}</p>
                    {groupedPlayers[pos]?.map(player => {
                      const fix = getNextFixture(player);
                      return (
                        <div key={player.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                          <div className="flex items-center gap-2">
                            <PlayerPhoto code={player.code} name={player.web_name} size="sm" />
                            <div>
                              <p className="text-sm font-medium leading-tight">
                                {player.web_name}
                                {player.is_captain && <Crown className="inline w-3 h-3 ml-1 text-amber-500" />}
                                {player.position > 11 && <span className="text-xs text-muted-foreground ml-1">(B)</span>}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{player.team_short_name} • £{(player.now_cost / 10).toFixed(1)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">{player.formScore.toFixed(1)}</span>
                            {fix && (
                              <Badge className={`text-[10px] px-1.5 ${getFDRColor(fix.difficulty)}`}>
                                {fix.isHome ? '' : '@'}{fix.opponent}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Middle: Recommendations */}
          <div className="lg:col-span-5 space-y-4">
            {/* Captain Card */}
            <Card className="border-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" /> Captain Recommendation
                </CardTitle>
                <CardDescription>Top 3 picks from your squad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {captainPicks.map((player, i) => {
                  const fix = getNextFixture(player);
                  const confidence = i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low';
                  const confColor = confidence === 'High' ? 'bg-emerald-500/20 text-emerald-700' : confidence === 'Medium' ? 'bg-amber-500/20 text-amber-700' : 'bg-red-500/20 text-red-700';
                  return (
                    <div key={player.id} className={`p-3 rounded-lg border ${i === 0 ? 'border-secondary/50 bg-accent/50' : 'border-border/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-display font-bold text-muted-foreground">#{i + 1}</span>
                          <PlayerPhoto code={player.code} name={player.web_name} size="md" />
                          <div>
                            <p className="font-semibold">{player.web_name}</p>
                            <p className="text-xs text-muted-foreground">{player.team_short_name} • {POSITION_MAP[player.element_type]}</p>
                          </div>
                        </div>
                        <Badge className={confColor}>{confidence}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Form: {player.formScore.toFixed(1)}</div>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Min: {player.minutesReliability.toFixed(1)}</div>
                        {fix && (
                          <div className="flex items-center gap-1">
                            {fix.isHome ? <Home className="w-3 h-3" /> : <Plane className="w-3 h-3" />}
                            vs {fix.opponent}
                          </div>
                        )}
                      </div>
                      {i === 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          <strong>Key factors:</strong> Highest captain score ({player.captainScore.toFixed(2)}), consistent minutes, favorable fixture.
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Starting XI Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Recommended XI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {starting.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                        <PlayerPhoto code={p.code} name={p.web_name} size="sm" />
                        <Badge variant="outline" className={`text-[10px] px-1 ${POSITION_COLORS[POSITION_MAP[p.element_type]]}`}>
                          {POSITION_MAP[p.element_type]}
                        </Badge>
                        <span className="text-sm font-medium">{p.web_name}</span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{p.captainScore.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Bench Order</p>
                  {bench.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between py-1 text-xs text-muted-foreground">
                      <span>{i + 1}. {p.web_name} ({POSITION_MAP[p.element_type]})</span>
                      <span className="font-mono">{p.captainScore.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transfer Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" /> Transfer Suggestions
                </CardTitle>
                <CardDescription>
                  Assuming £0.0 ITB • {allowHit ? '-4 hit allowed' : 'Free transfer only'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { tier: 'Safe', desc: 'Low-risk sideways move for form', color: 'border-emerald-500/30' },
                  { tier: 'Upside', desc: 'Higher ceiling, fixture-driven', color: 'border-amber-500/30' },
                  ...(allowHit ? [{ tier: 'Aggressive', desc: '-4 hit for double upgrade', color: 'border-red-500/30' }] : []),
                ].map(({ tier, desc, color }) => {
                  const weakest = [...squad.players].sort((a, b) => a.captainScore - b.captainScore)[0];
                  return (
                    <div key={tier} className={`p-3 rounded-lg border ${color}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold">{tier}</p>
                        <Badge variant="outline" className="text-[10px]">{tier === 'Aggressive' ? '-4 pts' : 'Free'}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{desc}</p>
                      <p className="text-xs">
                        <span className="text-destructive">OUT:</span> {weakest?.web_name} ({weakest?.team_short_name}) →{' '}
                        <span className="text-emerald-600">IN:</span> Best available {POSITION_MAP[weakest?.element_type ?? 3]}
                      </p>
                    </div>
                  );
                })}
                <p className="text-[10px] text-muted-foreground">
                  <AlertTriangle className="inline w-3 h-3 mr-1" />
                  Budget assumed £0.0 ITB. Actual transfers depend on your real budget.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right: AI Chat */}
          <div className="lg:col-span-4">
            <Card className="h-[calc(100vh-120px)] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary" /> AI Copilot
                  {isOfflineMode && <Badge variant="secondary" className="text-[10px]">Offline</Badge>}
                </CardTitle>
                <CardDescription>Ask anything about your FPL squad</CardDescription>
              </CardHeader>

              {/* Sample chips */}
              <div className="px-6 pb-3 flex flex-wrap gap-2 flex-shrink-0">
                {SAMPLE_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendChat(q)}
                    disabled={isChatLoading}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 pb-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Ask me about your squad!</p>
                      <p className="text-xs mt-1">Try one of the quick questions above.</p>
                    </div>
                  )}
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse delay-100" />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t flex-shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendChat(chatInput); }}
                  className="flex gap-2"
                >
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your squad..."
                    className="min-h-[44px] max-h-[120px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChat(chatInput);
                      }
                    }}
                  />
                  <Button type="submit" size="icon" disabled={isChatLoading || !chatInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
