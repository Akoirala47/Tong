// home.jsx — Tong home / play hub

// Home A: stacked CTA tiles (clear, traditional)
function S_HomeA() {
  return (
    <Phone label="07a · Home" sub="stacked CTA tiles">
      <div className="wf-col" style={{ padding: '14px 16px 6px', gap: 4 }}>
        <div className="wf-row" style={{ justifyContent: 'space-between' }}>
          <div className="wf-col">
            <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>HOLA · DAY 12 🔥</div>
            <div className="wf-hand" style={{ fontSize: 26 }}>Ready to grind?</div>
          </div>
          <div className="wf-row" style={{ gap: 6 }}>
            <RankBadge tier="SILVER" size={36} />
            <div className="wf-col" style={{ alignItems: 'flex-end' }}>
              <span className="wf-mono" style={{ fontSize: 10 }}>ELO 1247</span>
              <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>+18 wk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily quest banner */}
      <div style={{ margin: '8px 16px', padding: 10, border: `1.5px solid ${WF.ink}`, borderRadius: 10, background: WF.paper2, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>⚔</span>
        <div className="wf-col" style={{ flex: 1, gap: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 12 }}>Daily quest · 2 of 3</span>
          <div style={{ height: 4, background: WF.ink + '22', borderRadius: 2 }}>
            <div style={{ width: '66%', height: 4, background: WF.accent2, borderRadius: 2 }} />
          </div>
          <span className="wf-anno">play 1 ranked match to claim 80 XP</span>
        </div>
      </div>

      {/* Primary CTAs */}
      <div className="wf-col" style={{ padding: '8px 16px', gap: 10 }}>
        <div style={{ padding: 14, border: `2px solid ${WF.accent}`, borderRadius: 12, background: '#fff', position: 'relative' }}>
          <div className="wf-pill wf-pill-accent" style={{ position: 'absolute', top: -10, right: 12 }}>LIVE</div>
          <div className="wf-hand" style={{ fontSize: 22 }}>Ranked Arena</div>
          <div className="wf-anno">1v1 voice battle · 3 min · ±150 MMR</div>
          <Btn primary full size="l" style={{ marginTop: 8 }}>Queue up</Btn>
        </div>
        <div className="wf-row" style={{ gap: 10 }}>
          <div className="wf-box" style={{ flex: 1, padding: 12, borderRadius: 10 }}>
            <div className="wf-hand" style={{ fontSize: 18 }}>Solo Grind</div>
            <div className="wf-anno">Ch 4 · Past tense</div>
            <Btn full size="s" style={{ marginTop: 6 }}>Continue →</Btn>
          </div>
          <div className="wf-box" style={{ flex: 1, padding: 12, borderRadius: 10 }}>
            <div className="wf-hand" style={{ fontSize: 18 }}>Duels</div>
            <div className="wf-anno"><b>2</b> awaiting you</div>
            <Btn full size="s" style={{ marginTop: 6 }}>Open →</Btn>
          </div>
        </div>
        <div className="wf-row" style={{ gap: 10 }}>
          <div className="wf-box" style={{ flex: 1, padding: 10, borderRadius: 8 }}>
            <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>FLASHCARDS DUE</div>
            <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: WF.hand, fontSize: 24 }}>23</span>
              <span className="wf-anno">~4 min</span>
            </div>
          </div>
          <div className="wf-box" style={{ flex: 1, padding: 10, borderRadius: 8 }}>
            <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>BOSS BATTLE</div>
            <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: WF.hand, fontSize: 18 }}>Silver → Gold</span>
              <span className="wf-chip">3/5 ✓</span>
            </div>
          </div>
        </div>
      </div>
      <TabBar active="home" />
    </Phone>
  );
}

// Home B: hero with primary CTA centered (more game-y)
function S_HomeB() {
  return (
    <Phone label="07b · Home" sub="hero · gamer-mode">
      <div className="wf-col" style={{ height: '100%', background: WF.paper2 }}>
        <div style={{ padding: '12px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="wf-row" style={{ gap: 6 }}>
            <Placeholder h={28} style={{ width: 28, padding: 0, borderRadius: 14 }}>av</Placeholder>
            <span style={{ fontFamily: WF.sans, fontWeight: 700, fontSize: 13 }}>@alex_es</span>
          </div>
          <div className="wf-row" style={{ gap: 6 }}>
            <span className="wf-chip">🔥 12</span>
            <span className="wf-chip">⭐ 4,820</span>
          </div>
        </div>

        <div className="wf-col" style={{ alignItems: 'center', padding: 18, gap: 4 }}>
          <RankBadge tier="SILVER" size={92} />
          <div className="wf-hand" style={{ fontSize: 24 }}>Silver II · 1247 ELO</div>
          <div style={{ width: 200, height: 4, background: WF.ink + '22', borderRadius: 2, marginTop: 4 }}>
            <div style={{ width: '52%', height: 4, background: WF.accent, borderRadius: 2 }} />
          </div>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>253 to Gold</div>
        </div>

        <div style={{ padding: '0 18px' }}>
          <div className="wf-fill" style={{ borderRadius: 14, padding: 18, textAlign: 'center' }}>
            <div className="wf-hand" style={{ fontSize: 30, color: '#fff' }}>PLAY</div>
            <div className="wf-mono" style={{ fontSize: 11, opacity: 0.7 }}>1v1 ranked · solo queue</div>
          </div>
        </div>

        <div className="wf-row" style={{ padding: '14px 18px', gap: 8, justifyContent: 'space-between' }}>
          <div className="wf-col" style={{ alignItems: 'center', flex: 1 }}>
            <span style={{ fontSize: 20 }}>📚</span>
            <span className="wf-mono" style={{ fontSize: 10 }}>Grind</span>
          </div>
          <div className="wf-col" style={{ alignItems: 'center', flex: 1 }}>
            <span style={{ fontSize: 20 }}>🗣</span>
            <span className="wf-mono" style={{ fontSize: 10 }}>Duels · 2</span>
          </div>
          <div className="wf-col" style={{ alignItems: 'center', flex: 1 }}>
            <span style={{ fontSize: 20 }}>🃏</span>
            <span className="wf-mono" style={{ fontSize: 10 }}>Flash · 23</span>
          </div>
          <div className="wf-col" style={{ alignItems: 'center', flex: 1 }}>
            <span style={{ fontSize: 20 }}>👑</span>
            <span className="wf-mono" style={{ fontSize: 10 }}>Boss</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ margin: '0 18px 12px', padding: 10, borderTop: `1px dashed ${WF.dashed}` }}>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>RECENT</div>
          <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
            <span className="wf-mono" style={{ fontSize: 10 }}>vs @kenta · WIN</span>
            <span className="wf-mono" style={{ fontSize: 10, color: WF.accent2 }}>+18 ELO</span>
          </div>
          <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 2 }}>
            <span className="wf-mono" style={{ fontSize: 10 }}>vs @sara · loss</span>
            <span className="wf-mono" style={{ fontSize: 10, color: WF.accent }}>−12 ELO</span>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// Home C: feed-first (most experimental — async social emphasis)
function S_HomeC() {
  return (
    <Phone label="07c · Home" sub="feed-first · experimental">
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${WF.ink}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="wf-hand" style={{ fontSize: 24 }}>Today</div>
        <div className="wf-pill wf-pill-accent">QUEUE</div>
      </div>
      <div className="wf-col" style={{ padding: '8px 12px', gap: 8, overflow: 'auto' }}>
        {[
          { kind: 'duel', body: '@kenta replied · listen + send', meta: '10h left', accent: true },
          { kind: 'flash', body: '23 cards due — keep your streak', meta: '~4 min' },
          { kind: 'rank', body: 'NEW SEASON week 3 · climb to Gold', meta: '5 days' },
          { kind: 'duel', body: '@maria_x asked: "Cuéntame tu finde"', meta: '4h left', accent: true },
          { kind: 'ad', body: 'Plus removes ads + bumps duel cap to 8', meta: 'try free' },
          { kind: 'lesson', body: 'Next: Ch 4 — Past tense', meta: '~6 min' },
          { kind: 'boss', body: 'Boss Battle: Silver → Gold', meta: '3/5 ✓' },
        ].map((c, i) => (
          <div key={i} className="wf-box" style={{
            padding: 10, borderRadius: 8, display: 'flex', gap: 8,
            background: c.accent ? '#fdeae3' : WF.paper, borderColor: c.accent ? WF.accent : WF.ink,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              border: `1.5px solid ${c.accent ? WF.accent : WF.ink}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: WF.mono, fontSize: 10,
            }}>{c.kind.slice(0, 2).toUpperCase()}</div>
            <div className="wf-col" style={{ flex: 1, gap: 2 }}>
              <span style={{ fontWeight: 600, fontSize: 12 }}>{c.body}</span>
              <span className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>{c.meta}</span>
            </div>
            <span className="wf-mono" style={{ fontSize: 14 }}>›</span>
          </div>
        ))}
      </div>
      <TabBar active="home" />
    </Phone>
  );
}

Object.assign(window, { S_HomeA, S_HomeB, S_HomeC });
