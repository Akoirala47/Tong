// states.jsx — Tong edge / empty / loading / error wireframes

// ─── Empty: no active duels
function E_NoDuels() {
  return (
    <Phone label="E1 · Empty · No Duels">
      <NavBar left="" title="Async Duels" right="+" />
      <div className="wf-col" style={{ padding: 30, gap: 14, alignItems: 'center', textAlign: 'center', height: '100%' }}>
        <div style={{ fontSize: 56, marginTop: 24 }}>🗣</div>
        <div className="wf-hand" style={{ fontSize: 26 }}>No duels yet.</div>
        <div className="wf-anno" style={{ maxWidth: 220 }}>
          Async duels are like daily chess puzzles. Take a turn, send it, opponent has 12h. Low pressure, real ELO.
        </div>
        <Btn primary full size="l">Find an opponent →</Btn>
        <Btn full>How does this work?</Btn>
        <div style={{ flex: 1 }} />
      </div>
      <TabBar active="duels" />
    </Phone>
  );
}

// ─── Empty: no flashcards due
function E_NoFlashcards() {
  return (
    <Phone label="E2 · Empty · Flashcards clear">
      <NavBar left="✕" title="Flashcards" right="" />
      <div className="wf-col" style={{ padding: 30, gap: 14, alignItems: 'center', textAlign: 'center', height: '100%' }}>
        <div style={{ fontSize: 56, marginTop: 30 }}>🃏✨</div>
        <div className="wf-hand" style={{ fontSize: 26 }}>Inbox zero.</div>
        <div className="wf-anno" style={{ maxWidth: 240 }}>
          All due cards cleared. New cards arrive after lessons and live matches — go play to fill the deck.
        </div>
        <Btn primary full size="l">Queue a ranked match</Btn>
        <Btn full>Browse all cards (review mode)</Btn>
        <div style={{ flex: 1 }} />
        <div className="wf-anno" style={{ color: WF.muted }}>next batch due in ~6h</div>
      </div>
    </Phone>
  );
}

// ─── Loading: skeleton home
function E_LoadingHome() {
  return (
    <Phone label="E3 · Loading · Home skeleton">
      <div className="wf-col" style={{ padding: '14px 16px', gap: 8 }}>
        <div style={{ height: 18, width: 120, background: WF.paper2, borderRadius: 4 }} />
        <div style={{ height: 26, width: 200, background: WF.paper2, borderRadius: 4 }} />
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 80, background: WF.paper2, borderRadius: 12 }} />
        <div className="wf-row" style={{ gap: 10 }}>
          <div style={{ flex: 1, height: 72, background: WF.paper2, borderRadius: 10 }} />
          <div style={{ flex: 1, height: 72, background: WF.paper2, borderRadius: 10 }} />
        </div>
        <div className="wf-row" style={{ gap: 10 }}>
          <div style={{ flex: 1, height: 56, background: WF.paper2, borderRadius: 8 }} />
          <div style={{ flex: 1, height: 56, background: WF.paper2, borderRadius: 8 }} />
        </div>
        <div className="wf-anno" style={{ textAlign: 'center', color: WF.muted, padding: 16 }}>
          shimmering rectangles · animate via CSS<br />
          show after 250ms of network · cancel if data arrives early
        </div>
      </div>
      <TabBar active="home" />
    </Phone>
  );
}

// ─── Error: no opponent found
function E_NoMatch() {
  return (
    <Phone label="E4 · Error · No Match">
      <NavBar left="✕" title="Queue timed out" right="" />
      <div className="wf-col" style={{ padding: 24, gap: 14, alignItems: 'center', textAlign: 'center', height: '100%' }}>
        <div style={{ fontSize: 52, marginTop: 18 }}>👻</div>
        <div className="wf-hand" style={{ fontSize: 26 }}>No opponent found.</div>
        <div className="wf-anno" style={{ maxWidth: 240 }}>
          We searched 5 minutes inside ±150 MMR · ES · solo. Quiet hours. Try one of these:
        </div>
        <div className="wf-col" style={{ alignSelf: 'stretch', gap: 6 }}>
          {[
            ['Widen MMR to ±300',     '+13s avg wait'],
            ['Switch to ES / casual', 'no ELO at stake'],
            ['Try an Async Duel',     '12h opponent window'],
            ['Notify when an opponent appears', 'push when ready'],
          ].map(([t, d], i) => (
            <div key={i} className="wf-row" style={{ padding: 10, border: `1.5px solid ${WF.ink}`, borderRadius: 8, gap: 8 }}>
              <div className="wf-col" style={{ flex: 1, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{t}</span>
                <span className="wf-anno">{d}</span>
              </div>
              <span className="wf-mono" style={{ fontSize: 12 }}>›</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Btn primary full size="l">Retry queue</Btn>
      </div>
    </Phone>
  );
}

// ─── Error: opponent disconnected mid-match
function E_Disconnect() {
  return (
    <Phone label="E5 · Mid-Match Disconnect" accentBar dark>
      <div className="wf-col" style={{ height: '100%', color: '#fff', padding: 22, gap: 14, alignItems: 'center', textAlign: 'center' }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.accent }}>⚠ OPPONENT DROPPED</div>
        <div className="wf-hand" style={{ fontSize: 32 }}>Hold tight…</div>
        <div className="wf-anno" style={{ color: '#fff8' }}>
          @bea_es lost connection. Agora is trying to reconnect for the next 30 seconds.
        </div>
        <div style={{ width: 200, height: 6, background: '#fff2', borderRadius: 3 }}>
          <div style={{ width: '70%', height: 6, background: WF.accent, borderRadius: 3 }} />
        </div>
        <div className="wf-mono" style={{ fontSize: 22, color: WF.accent }}>0:21</div>
        <div className="wf-anno" style={{ color: '#fff5', maxWidth: 240 }}>
          If they don't return, you win by default + half ELO. Match marked `disconnect-forfeit`.
        </div>
        <div style={{ flex: 1 }} />
        <Btn primary full size="l" style={{ background: '#fff', color: WF.ink, borderColor: '#fff' }}>Claim win now</Btn>
        <Btn full size="s" style={{ borderColor: '#fff', color: '#fff' }}>Wait it out</Btn>
      </div>
    </Phone>
  );
}

// ─── Error: mic blocked
function E_MicBlocked() {
  return (
    <Phone label="E6 · Mic Permission Denied">
      <NavBar left="< Back" title="Mic needed" right="" />
      <div className="wf-col" style={{ padding: 24, gap: 14, textAlign: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ fontSize: 50 }}>🎤🚫</div>
        <div className="wf-hand" style={{ fontSize: 28 }}>We can't hear you.</div>
        <div className="wf-anno" style={{ maxWidth: 240 }}>
          Tong needs microphone access. Without it you can grind solo + flashcards, but no duels or ranked matches.
        </div>
        <div className="wf-box" style={{ alignSelf: 'stretch', padding: 12, borderRadius: 8, textAlign: 'left' }}>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>TO ENABLE</div>
          {[
            '1. Open Settings',
            '2. Tap Tong',
            '3. Toggle Microphone → on',
          ].map((t, i) => <div key={i} className="wf-anno" style={{ marginTop: 4 }}>{t}</div>)}
        </div>
        <div style={{ flex: 1 }} />
        <Btn primary full size="l">Open Settings</Btn>
        <Btn full>Continue text-only</Btn>
      </div>
    </Phone>
  );
}

// ─── Error: free-tier cap hit (duels)
function E_DuelCap() {
  return (
    <Phone label="E7 · Cap · Free duels 3/3">
      <NavBar left="< Duels" title="Duel cap reached" right="" />
      <div className="wf-col" style={{ padding: 24, gap: 14, alignItems: 'center', textAlign: 'center', height: '100%' }}>
        <div style={{ fontSize: 52 }}>⛔</div>
        <div className="wf-hand" style={{ fontSize: 26 }}>3 active duels is the<br /> free-tier limit.</div>
        <div className="wf-anno" style={{ maxWidth: 240 }}>
          Finish one (or forfeit) — or upgrade to Plus for 8 active duels.
        </div>
        <div className="wf-col" style={{ alignSelf: 'stretch', gap: 6 }}>
          {[
            ['@kenta_ja · R3/3 grading', 'finishes ~5 min'],
            ['@maria_es · your turn',     '4h left'],
            ['@dan_fr · their turn',      '~11h'],
          ].map(([t, m], i) => (
            <div key={i} className="wf-row" style={{ padding: 8, border: `1px solid ${WF.ink}`, borderRadius: 6 }}>
              <span className="wf-mono" style={{ fontSize: 11, flex: 1, textAlign: 'left' }}>{t}</span>
              <span className="wf-anno">{m}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Btn primary full size="l">Upgrade to Plus · $9.99</Btn>
        <Btn full>Wait for one to finish</Btn>
        <div className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>
          server returns 403 · "Daily duel limit reached"
        </div>
      </div>
    </Phone>
  );
}

// ─── Error: post-match grading failed (degraded result)
function E_GradingFailed() {
  return (
    <Phone label="E8 · Grading Degraded">
      <NavBar left="< Home" title="Result · partial" right="" />
      <div className="wf-col" style={{ padding: 20, gap: 14, alignItems: 'center', textAlign: 'center', height: '100%' }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.warn }}>⚠ DEGRADED GRADING</div>
        <div className="wf-hand" style={{ fontSize: 26 }}>ELO update only.</div>
        <div className="wf-anno" style={{ maxWidth: 240 }}>
          Whisper worker hit an error grading your audio. Your ELO is locked in (winner determined from prompt-adherence heuristics) — but transcript & feedback are unavailable.
        </div>
        <div className="wf-col" style={{ alignSelf: 'stretch', gap: 4 }}>
          {[
            ['ELO',         '+18 → 1265'],
            ['Win/Loss',    'WIN'],
            ['Transcript',  '— failed'],
            ['Feedback',    '— failed'],
            ['Flashcards',  '— skipped'],
          ].map(([k, v], i) => (
            <div key={i} className="wf-row" style={{ justifyContent: 'space-between', padding: 6, border: `1px dashed ${WF.dashed}`, borderRadius: 4 }}>
              <span className="wf-mono" style={{ fontSize: 10 }}>{k}</span>
              <span className="wf-mono" style={{ fontSize: 10, color: v.startsWith('—') ? WF.muted : WF.ink }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="wf-anno" style={{ background: WF.paper2, padding: 8, borderRadius: 6 }}>
          Engineering: Sentry alert fires · pipeline re-queue available via /matches/&#123;id&#125;/regrade (Pro+ only)
        </div>
        <div style={{ flex: 1 }} />
        <Btn primary full size="l">Play again</Btn>
        <Btn full>Contact support</Btn>
      </div>
    </Phone>
  );
}

// ─── Toxicity: warned
function E_Toxicity() {
  return (
    <Phone label="E9 · Toxicity Warning">
      <NavBar left="" title="Heads up" right="" accent />
      <div className="wf-col" style={{ padding: 22, gap: 14, alignItems: 'center', textAlign: 'center', height: '100%' }}>
        <div style={{ fontSize: 48 }}>⚠</div>
        <div className="wf-hand" style={{ fontSize: 26, color: WF.accent }}>Slur detected.</div>
        <div className="wf-anno" style={{ maxWidth: 240 }}>
          A post-match transcript scan flagged a slur in your last match (vs @bea_es · 0:48). This is your <b>first warning</b>.
        </div>
        <div className="wf-box" style={{ padding: 10, borderRadius: 8, background: WF.paper2, alignSelf: 'stretch' }}>
          <div className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>POLICY</div>
          <div className="wf-anno" style={{ textAlign: 'left' }}>
            1st: warning · 2nd: 24h queue ban · 3rd: 7d queue ban · 4th: permanent
          </div>
        </div>
        <Btn full>Listen back · what was flagged</Btn>
        <Btn full>Dispute (open ticket)</Btn>
        <div style={{ flex: 1 }} />
        <Btn primary full size="l">Acknowledged</Btn>
        <div className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>
          enforcement at queue entry · M-10 · no live RTT
        </div>
      </div>
    </Phone>
  );
}

// ─── Ad interstitial (free tier)
function E_AdInterstitial() {
  return (
    <Phone label="E10 · Ad Interstitial · Free tier">
      <div className="wf-col" style={{ height: '100%', background: WF.paper2 }}>
        <div style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between' }}>
          <span className="wf-mono" style={{ fontSize: 10 }}>Ad · skip in 0:03</span>
          <span className="wf-mono" style={{ fontSize: 10 }}>✕</span>
        </div>
        <div style={{ flex: 1, margin: 16, border: `2px dashed ${WF.dashed}`, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 22 }}>
          <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>3RD-PARTY AD MEDIATION</span>
          <div className="wf-hand" style={{ fontSize: 26, marginTop: 8 }}>[ ad creative ]</div>
          <div className="wf-anno" style={{ marginTop: 6 }}>full-screen rewarded · 8–15s · 320×480</div>
        </div>
        <div style={{ padding: 14 }}>
          <div className="wf-box" style={{ padding: 10, borderRadius: 8, background: WF.paper, borderColor: WF.accent, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 24 }}>👀</span>
            <div className="wf-col" style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 12 }}>Sick of ads?</span>
              <span className="wf-anno">Plus removes them — try free for 7 days.</span>
            </div>
            <Btn primary size="s">Upgrade</Btn>
          </div>
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, { E_NoDuels, E_NoFlashcards, E_LoadingHome, E_NoMatch, E_Disconnect, E_MicBlocked, E_DuelCap, E_GradingFailed, E_Toxicity, E_AdInterstitial });
