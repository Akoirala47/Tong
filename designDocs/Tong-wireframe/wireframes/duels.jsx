// duels.jsx — Tong Async Audio Duels wireframes

// ─── Active duels list A: stacked rows
function S_DuelsListA() {
  const duels = [
    { who: '@kenta_ja',   rank: 'GOLD', state: 'YOUR TURN', meta: '10h left',  round: 'R2/3', accent: true },
    { who: '@maria_es',   rank: 'SILVER', state: 'YOUR TURN', meta: '4h left', round: 'R1/3', accent: true },
    { who: '@dan_fr',     rank: 'SILVER', state: 'their turn', meta: '~11h',   round: 'R3/3' },
    { who: '@nina_jp',    rank: 'GOLD',   state: 'grading',    meta: 'just now', round: 'final' },
    { who: '@luca_it',    rank: 'BRONZE', state: 'completed · WON',  meta: '+11 ELO', round: 'done' },
  ];
  return (
    <Phone label="17a · Active Duels" sub="list view">
      <NavBar left="" title="Async Duels" right="+" />
      <div style={{ padding: '8px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="wf-row" style={{ gap: 6 }}>
          <span className="wf-pill wf-pill-fill">Active 4</span>
          <span className="wf-pill">Done</span>
          <span className="wf-pill">Friends</span>
        </div>
        <span className="wf-mono" style={{ fontSize: 10, color: WF.warn }}>3/3 active · free cap</span>
      </div>
      <div className="wf-col" style={{ padding: '4px 12px', gap: 6, overflow: 'auto' }}>
        {duels.map((d, i) => (
          <div key={i} className="wf-box" style={{
            padding: 10, borderRadius: 8, display: 'flex', gap: 10,
            borderColor: d.accent ? WF.accent : WF.ink,
            background: d.accent ? '#fdeae3' : WF.paper,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, border: `1.5px solid ${WF.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: WF.mono, fontSize: 11 }}>av</div>
            <div className="wf-col" style={{ flex: 1, gap: 2 }}>
              <div className="wf-row" style={{ gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 12 }}>{d.who}</span>
                <span className="wf-chip" style={{ padding: '1px 5px', fontSize: 9 }}>{d.rank}</span>
              </div>
              <div className="wf-row" style={{ gap: 6 }}>
                <span className="wf-mono" style={{ fontSize: 10, color: d.accent ? WF.accent : WF.muted, fontWeight: d.accent ? 700 : 400 }}>{d.state}</span>
                <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>· {d.round} · {d.meta}</span>
              </div>
            </div>
            <span className="wf-mono" style={{ fontSize: 16 }}>›</span>
          </div>
        ))}
      </div>
      {/* Floating new-duel CTA */}
      <div style={{ position: 'absolute', bottom: 70, right: 16 }}>
        <div className="wf-fill" style={{ width: 56, height: 56, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: WF.shadow }}>+</div>
      </div>
      <TabBar active="duels" />
    </Phone>
  );
}

// ─── Active duels B: chess-puzzle grid (experimental)
function S_DuelsListB() {
  return (
    <Phone label="17b · Duels" sub="puzzle-grid · experimental">
      <NavBar left="" title="Your moves" right="cap 3/3" />
      <div style={{ padding: 12 }}>
        <div className="wf-anno" style={{ background: '#fdeae3', padding: 8, borderRadius: 6, border: `1px solid ${WF.accent}` }}>
          ⚡ 2 puzzles waiting — your turn. Average reply: ~32s.
        </div>
      </div>
      <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { who: '@kenta_ja', accent: true,  meta: '10h' },
          { who: '@maria_es', accent: true,  meta: '4h' },
          { who: '@dan_fr',   accent: false, meta: 'wait' },
          { who: '@nina_jp',  accent: false, meta: 'grading' },
        ].map((d, i) => (
          <div key={i} style={{
            padding: 10, border: `2px solid ${d.accent ? WF.accent : WF.ink}`,
            borderRadius: 10, background: d.accent ? '#fdeae3' : WF.paper,
            aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div className="wf-row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 11 }}>{d.who}</span>
              <span className="wf-mono" style={{ fontSize: 9 }}>{d.meta}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <VoiceWave w={90} h={28} n={20} active={d.accent} />
            </div>
            <div className="wf-row" style={{ justifyContent: 'space-between' }}>
              <span className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>R2/3</span>
              <span className="wf-mono" style={{ fontSize: 11, color: d.accent ? WF.accent : WF.muted }}>{d.accent ? '▶ play' : '⏳'}</span>
            </div>
          </div>
        ))}
        {/* CTA grid cell */}
        <div className="wf-dashed" style={{ aspectRatio: '1 / 1', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: WF.muted }}>
          <span style={{ fontSize: 24 }}>＋</span>
          <span className="wf-mono" style={{ fontSize: 10 }}>new duel</span>
        </div>
      </div>
      <TabBar active="duels" />
    </Phone>
  );
}

// ─── Duel detail · listening to opponent
function S_DuelListen() {
  return (
    <Phone label="18 · Duel · Listen">
      <NavBar left="< Duels" title="vs @kenta_ja" right="⋯" />
      <div className="wf-col" style={{ padding: '10px 16px', gap: 4 }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>PROMPT</div>
        <div className="wf-hand" style={{ fontSize: 20, lineHeight: 1.15 }}>
          "Describe your weirdest meal — and would you eat it again?"
        </div>
        <div className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>JIT-generated · uses your shared vocab + 1 slang (P-03)</div>
      </div>

      {/* Turn track */}
      <div className="wf-col" style={{ padding: '10px 12px', gap: 6, flex: 1 }}>
        <div className="wf-row" style={{ justifyContent: 'space-between', padding: '4px 4px' }}>
          <span className="wf-mono" style={{ fontSize: 10 }}>R1 ✓</span>
          <span className="wf-mono" style={{ fontSize: 10 }}>R2 ←</span>
          <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>R3</span>
        </div>

        {/* P1 move (you, prev) */}
        <div className="wf-row" style={{ alignSelf: 'flex-end', gap: 6, maxWidth: '85%' }}>
          <div className="wf-box" style={{ padding: 8, borderRadius: 8, background: WF.paper2, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 16 }}>▶</span>
            <VoiceWave w={120} h={22} n={20} active={false} />
            <span className="wf-mono" style={{ fontSize: 10 }}>0:42</span>
          </div>
          <span className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>you</span>
        </div>

        {/* P2 move (new — large playback affordance) */}
        <div className="wf-row" style={{ gap: 6, maxWidth: '85%' }}>
          <span className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>K</span>
          <div className="wf-box" style={{ padding: 10, borderRadius: 8, background: '#fdeae3', borderColor: WF.accent, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <div className="wf-row" style={{ gap: 8, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: WF.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>▶</div>
              <VoiceWave w={120} h={26} n={24} color={WF.accent} />
              <span className="wf-mono" style={{ fontSize: 10 }}>1:14</span>
            </div>
            <div className="wf-row" style={{ gap: 6 }}>
              <Btn size="s">0.7×</Btn>
              <Btn size="s">⟲ Replay</Btn>
              <Btn size="s">Aa</Btn>
            </div>
            <div className="wf-anno" style={{ borderTop: `1px dashed ${WF.dashed}`, paddingTop: 6 }}>
              Aa → live transcript (Pro+) · free tier: replay only
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <div className="wf-anno" style={{ color: WF.muted, textAlign: 'center' }}>10h 12m to respond · forfeit at 0</div>
      </div>

      <div style={{ padding: '10px 16px 0' }}>
        <Btn primary full size="l">🎙 Record your move →</Btn>
      </div>
    </Phone>
  );
}

// ─── Duel record · recording state
function S_DuelRecord() {
  return (
    <Phone label="19a · Duel · Recording">
      <NavBar left="✕" title="Your move · R2/3" right="0:90 max" />
      <div className="wf-col" style={{ padding: 20, gap: 14, alignItems: 'center', textAlign: 'center', flex: 1 }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>PROMPT</div>
        <div className="wf-hand" style={{ fontSize: 18, lineHeight: 1.2 }}>
          "Describe your weirdest meal — and would you eat it again?"
        </div>
        <div className="wf-divider" style={{ alignSelf: 'stretch' }} />
        <VoiceWave w={260} h={56} n={48} color={WF.accent} />
        <div className="wf-mono" style={{ fontSize: 28, color: WF.accent, letterSpacing: 1 }}>0:23</div>
        <div className="wf-anno">tap to pause · long-press to scrub</div>
        <div style={{ flex: 1 }} />
        <div style={{
          width: 92, height: 92, borderRadius: 46, background: WF.accent,
          border: `4px solid ${WF.accent}`, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
          boxShadow: '0 0 0 8px #fdeae3',
        }}>■</div>
        <div className="wf-row" style={{ gap: 10 }}>
          <Btn size="s">Restart</Btn>
          <Btn size="s">Preview</Btn>
        </div>
      </div>
    </Phone>
  );
}

// ─── Duel record · preview before send
function S_DuelPreview() {
  return (
    <Phone label="19b · Duel · Preview & Send">
      <NavBar left="< Re-record" title="Send your move?" right="" />
      <div className="wf-col" style={{ padding: 20, gap: 12, alignItems: 'center', flex: 1 }}>
        <div className="wf-box" style={{ padding: 14, borderRadius: 10, alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: WF.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>▶</div>
          <div className="wf-col" style={{ flex: 1, gap: 4 }}>
            <VoiceWave w={180} h={26} n={28} />
            <span className="wf-mono" style={{ fontSize: 10 }}>0:52 / 1:30 max</span>
          </div>
        </div>

        <div className="wf-col" style={{ alignSelf: 'stretch', gap: 6 }}>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>QUICK CHECK</div>
          {[
            ['Volume',   'good · -14 LUFS'],
            ['Length',   '52s · within limit'],
            ['Words detected', '~94 (Plus shows count)'],
          ].map(([k, v], i) => (
            <div key={i} className="wf-row" style={{ justifyContent: 'space-between', padding: 6, border: `1px solid ${WF.ink}22`, borderRadius: 4 }}>
              <span className="wf-mono" style={{ fontSize: 10 }}>{k}</span>
              <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="wf-anno" style={{ background: WF.paper2, padding: 8, borderRadius: 6 }}>
          Once sent, you can't edit. Opponent gets a push notification.
        </div>

        <div style={{ flex: 1 }} />
        <Btn full>Re-record</Btn>
        <Btn primary full size="l">Send move · advance turn</Btn>
        <div className="wf-mono" style={{ fontSize: 9, color: WF.muted, textAlign: 'center' }}>
          PUT pre-signed R2 URL · POST /duels/.../move
        </div>
      </div>
    </Phone>
  );
}

// ─── Duel result
function S_DuelResult() {
  return (
    <Phone label="20 · Duel Result">
      <NavBar left="✕" title="Duel done · 3 rounds" right="" />
      <div className="wf-col" style={{ padding: 18, gap: 12, alignItems: 'center', textAlign: 'center', flex: 1 }}>
        <div className="wf-hand" style={{ fontSize: 36, color: WF.accent2, marginTop: 6 }}>You won.</div>

        <div className="wf-row" style={{ gap: 20, alignSelf: 'stretch', justifyContent: 'space-around' }}>
          <div className="wf-col" style={{ alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, border: `2px solid ${WF.accent2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: WF.hand, fontSize: 26 }}>YOU</div>
            <div className="wf-mono" style={{ fontSize: 11 }}>74.5 / 100</div>
            <div className="wf-mono" style={{ fontSize: 11, color: WF.accent2 }}>+4 ELO</div>
          </div>
          <div className="wf-hand" style={{ fontSize: 28, alignSelf: 'center' }}>vs</div>
          <div className="wf-col" style={{ alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, border: `2px solid ${WF.muted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: WF.hand, fontSize: 16 }}>@kenta</div>
            <div className="wf-mono" style={{ fontSize: 11 }}>68.1 / 100</div>
            <div className="wf-mono" style={{ fontSize: 11, color: WF.accent }}>−4 ELO</div>
          </div>
        </div>

        <div className="wf-col" style={{ alignSelf: 'stretch', gap: 6 }}>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>BREAKDOWN  (free tier = ELO only)</div>
          {[
            ['Prompt adherence', '85 / 100'],
            ['Vocab complexity', '72 / 100'],
            ['Filler words',     '6 (3 "uhm", 2 "like")'],
            ['Mispronounced',    'tuve, esperaba'],
          ].map(([k, v], i) => (
            <div key={i} className="wf-row" style={{ justifyContent: 'space-between', padding: 6, border: `1px dashed ${WF.dashed}`, borderRadius: 4 }}>
              <span className="wf-mono" style={{ fontSize: 10 }}>{k}</span>
              <span className="wf-mono" style={{ fontSize: 10 }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="wf-anno" style={{ background: '#fff5d8', padding: 8, borderRadius: 6, alignSelf: 'stretch', textAlign: 'left' }}>
          🃏 <b>tuve</b> + <b>esperaba</b> added to your flashcards. Drilling now boosts your next match.
        </div>

        <div style={{ flex: 1 }} />
        <Btn primary full size="l">Listen back · VOD review →</Btn>
        <Btn full>New duel</Btn>
      </div>
    </Phone>
  );
}

Object.assign(window, { S_DuelsListA, S_DuelsListB, S_DuelListen, S_DuelRecord, S_DuelPreview, S_DuelResult });
