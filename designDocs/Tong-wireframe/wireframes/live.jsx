// live.jsx — Tong Live Ranked PvP wireframes

// ─── Queue setup A: classic (mode + language)
function S_QueueA() {
  return (
    <Phone label="21a · Queue Setup" sub="classic mode select" accentBar>
      <NavBar left="< Home" title="Ranked" right="?" accent />
      <div className="wf-col" style={{ padding: 18, gap: 14 }}>
        <div className="wf-row" style={{ gap: 8 }}>
          <RankBadge tier="SILVER" size={48} />
          <div className="wf-col" style={{ gap: 2, flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Silver II · 1247</span>
            <div style={{ height: 4, background: WF.ink + '22', borderRadius: 2 }}>
              <div style={{ width: '52%', height: 4, background: WF.accent }} />
            </div>
            <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>253 to GOLD · win rate 56%</span>
          </div>
        </div>
        <div className="wf-divider" />

        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>LANGUAGE</div>
        <div className="wf-row" style={{ gap: 6 }}>
          {[['🇪🇸','ES'],['🇯🇵','JP'],['🇰🇷','KR'],['🇫🇷','FR']].map(([f, n], i) => (
            <div key={i} style={{
              flex: 1, padding: '8px 4px', textAlign: 'center', border: `1.5px solid ${WF.ink}`, borderRadius: 6,
              background: i === 0 ? WF.ink : 'transparent', color: i === 0 ? '#fff' : WF.ink,
            }}>{f} <span className="wf-mono" style={{ fontSize: 10 }}>{n}</span></div>
          ))}
        </div>

        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3, marginTop: 4 }}>MODE</div>
        <div className="wf-col" style={{ gap: 8 }}>
          <div style={{ padding: 12, border: `2px solid ${WF.accent}`, borderRadius: 10, background: '#fdeae3' }}>
            <div className="wf-row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>SOLO · 1v1</span>
              <span className="wf-pill wf-pill-accent">RANKED</span>
            </div>
            <span className="wf-anno">3 min · ±150 MMR · ELO at stake</span>
          </div>
          <div style={{ padding: 12, border: `1.5px solid ${WF.ink}`, borderRadius: 10, opacity: 0.5 }}>
            <div className="wf-row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>DUO · 2v2</span>
              <span className="wf-chip">Post-MVP</span>
            </div>
            <span className="wf-anno">Squad queue · invite a friend</span>
          </div>
          <div style={{ padding: 12, border: `1.5px dashed ${WF.dashed}`, borderRadius: 10 }}>
            <div className="wf-row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>CASUAL · 1v1</span>
              <span className="wf-chip">no ELO</span>
            </div>
            <span className="wf-anno">warm-up · still feeds VOD review</span>
          </div>
        </div>

        <div className="wf-anno" style={{ background: WF.paper2, padding: 8, borderRadius: 6 }}>
          ⚠ free tier · first match of the day gets <b>lite</b> coaching (whisper-small).<br />
          subsequent same-day matches → ELO-only result.
        </div>
        <Btn primary full size="l">QUEUE UP</Btn>
      </div>
    </Phone>
  );
}

// ─── Queue setup B: "instant brawl" (one-tap, novel)
function S_QueueB() {
  return (
    <Phone label="21b · Queue" sub="one-tap brawl · experimental" accentBar dark>
      <div className="wf-col" style={{ height: '100%', padding: 18, color: '#fff', alignItems: 'center', gap: 14 }}>
        <div className="wf-mono" style={{ fontSize: 10, color: '#fff8' }}>SEASON 1 · WEEK 3</div>
        <RankBadge tier="SILVER" size={84} />
        <div className="wf-hand" style={{ fontSize: 28, color: '#fff' }}>Silver II</div>
        <div className="wf-mono" style={{ fontSize: 11, color: '#fff8' }}>ELO 1247  ·  +18 this week</div>

        <div style={{ flex: 1 }} />

        <div style={{
          width: 200, height: 200, borderRadius: 100,
          background: WF.accent, color: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
          boxShadow: `0 0 0 12px ${WF.accent}33, 0 0 0 24px ${WF.accent}11`,
        }}>
          <div className="wf-hand" style={{ fontSize: 56, lineHeight: 1 }}>PLAY</div>
          <div className="wf-mono" style={{ fontSize: 10, opacity: 0.9 }}>tap & hold to queue</div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="wf-row" style={{ gap: 10 }}>
          <span className="wf-pill" style={{ background: '#fff2', borderColor: '#fff', color: '#fff' }}>🇪🇸 ES</span>
          <span className="wf-pill" style={{ background: '#fff2', borderColor: '#fff', color: '#fff' }}>SOLO</span>
          <span className="wf-pill" style={{ background: '#fff2', borderColor: '#fff', color: '#fff' }}>RANKED</span>
        </div>
        <div className="wf-mono" style={{ fontSize: 9, color: '#fff5', textAlign: 'center' }}>swipe right for friend invite · left for casual</div>
      </div>
    </Phone>
  );
}

// ─── Matchmaking (in-queue)
function S_Matchmaking() {
  return (
    <Phone label="22 · Matchmaking…">
      <NavBar left="✕ Leave queue" title="Searching" right="" />
      <div className="wf-col" style={{ padding: 22, alignItems: 'center', gap: 14, height: '100%' }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>ES · SOLO · RANKED</div>

        <div style={{ position: 'relative', width: 160, height: 160 }}>
          {[160, 130, 100, 70].map((s, i) => (
            <div key={i} style={{
              position: 'absolute', width: s, height: s, borderRadius: '50%',
              top: (160 - s) / 2, left: (160 - s) / 2,
              border: `1.5px dashed ${WF.ink}`,
              opacity: 0.2 + i * 0.18,
              animation: `pulse 2s ease-in-out ${i * 0.3}s infinite`,
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 60, borderRadius: '50%',
            background: WF.ink, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: WF.hand, fontSize: 18,
          }}>YOU</div>
        </div>

        <div className="wf-hand" style={{ fontSize: 28 }}>Looking for…</div>
        <div className="wf-col" style={{ alignSelf: 'stretch', gap: 4 }}>
          {[
            ['MMR range',    '1097 — 1397 (±150)'],
            ['Latency',      '< 120ms (US-East)'],
            ['Pool',         '142 players in ES solo'],
            ['Avg wait',     '~28s'],
          ].map(([k, v], i) => (
            <div key={i} className="wf-row" style={{ justifyContent: 'space-between' }}>
              <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>{k}</span>
              <span className="wf-mono" style={{ fontSize: 10 }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="wf-mono" style={{ fontSize: 22, marginTop: 4 }}>0:32</div>
        <div className="wf-anno" style={{ color: WF.muted, textAlign: 'center' }}>
          backend: Redis ZSET `queue:es` · matcher polls 2s<br />
          WebSocket push on pair · 5-min timeout
        </div>

        <div style={{ flex: 1 }} />
        <div className="wf-anno" style={{ alignSelf: 'stretch', borderTop: `1px dashed ${WF.dashed}`, paddingTop: 8 }}>
          💡 while you wait → 3 quick flashcards
        </div>
      </div>
    </Phone>
  );
}

// ─── Match found / lobby (prompt reveal)
function S_Lobby() {
  return (
    <Phone label="23 · Match Lobby" sub="prompt revealed">
      <div className="wf-col" style={{ height: '100%' }}>
        <div style={{ background: WF.accent, color: '#fff', padding: '14px 16px', textAlign: 'center' }}>
          <div className="wf-hand" style={{ fontSize: 26 }}>MATCH FOUND</div>
          <div className="wf-mono" style={{ fontSize: 10, opacity: 0.85 }}>be ready in 0:08…</div>
        </div>

        <div className="wf-row" style={{ padding: 14, justifyContent: 'space-around', alignItems: 'center' }}>
          <div className="wf-col" style={{ alignItems: 'center', gap: 4 }}>
            <RankBadge tier="SILVER" size={44} />
            <span style={{ fontWeight: 700, fontSize: 12 }}>@you</span>
            <span className="wf-mono" style={{ fontSize: 10 }}>1247</span>
          </div>
          <div className="wf-hand" style={{ fontSize: 28 }}>VS</div>
          <div className="wf-col" style={{ alignItems: 'center', gap: 4 }}>
            <RankBadge tier="SILVER" size={44} />
            <span style={{ fontWeight: 700, fontSize: 12 }}>@bea_es</span>
            <span className="wf-mono" style={{ fontSize: 10 }}>1281</span>
          </div>
        </div>

        <div className="wf-col" style={{ padding: '6px 16px', gap: 6 }}>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>SCENARIO</div>
          <div className="wf-box" style={{ padding: 14, borderRadius: 10, background: WF.paper2 }}>
            <div className="wf-hand" style={{ fontSize: 22, lineHeight: 1.15 }}>
              You're at a small-town bus station. <span style={{ color: WF.accent }}>One of you is the worried tourist</span>, the other is the local trying to help. The last bus is leaving soon.
            </div>
            <div className="wf-row" style={{ marginTop: 8, flexWrap: 'wrap', gap: 4 }}>
              <span className="wf-chip">role: TOURIST</span>
              <span className="wf-chip">target: el último, perder, andén</span>
              <span className="wf-chip">slang: "qué fuerte"</span>
            </div>
          </div>
          <div className="wf-anno" style={{ color: WF.muted }}>P-03 · DeepSeek JIT-generated from shared vocab</div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="wf-col" style={{ padding: '0 16px 14px', gap: 8 }}>
          <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: 8, border: `1px solid ${WF.ink}`, borderRadius: 6 }}>
            <span className="wf-mono" style={{ fontSize: 10 }}>🎤 mic check</span>
            <VoiceWave w={120} h={20} n={20} />
            <span className="wf-mono" style={{ fontSize: 10, color: WF.accent2 }}>good</span>
          </div>
          <Btn primary full size="l">I'm READY (1/2)</Btn>
          <div className="wf-mono" style={{ fontSize: 9, color: WF.muted, textAlign: 'center' }}>
            both ready → Agora token issued · recording started server-side
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ─── Live battle A: split with timer (focused)
function S_LiveBattle() {
  return (
    <Phone label="24a · Live Battle" sub="prompt + timer · focused" accentBar dark>
      <div className="wf-col" style={{ height: '100%', color: '#fff' }}>
        <div className="wf-row" style={{ padding: '10px 16px', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="wf-pill wf-pill-accent">● REC</span>
          <div className="wf-col" style={{ alignItems: 'center' }}>
            <span className="wf-hand" style={{ fontSize: 32, color: WF.accent }}>02:14</span>
            <span className="wf-mono" style={{ fontSize: 9, color: '#fff8' }}>3:00 total</span>
          </div>
          <span className="wf-mono" style={{ fontSize: 10 }}>FORFEIT</span>
        </div>

        <div style={{ padding: '8px 16px' }}>
          <div className="wf-mono" style={{ fontSize: 9, color: WF.accent }}>PROMPT · still visible</div>
          <div className="wf-sans" style={{ fontSize: 12, color: '#fff', lineHeight: 1.3 }}>
            You're at a bus station. You're the worried <b>tourist</b>. Last bus is leaving soon.
          </div>
        </div>

        <div className="wf-row" style={{ padding: '8px 16px', gap: 10 }}>
          <span className="wf-chip" style={{ background: '#fff1', borderColor: '#fff5', color: '#fff' }}>el último</span>
          <span className="wf-chip" style={{ background: '#fff1', borderColor: '#fff5', color: '#fff' }}>perder</span>
          <span className="wf-chip" style={{ background: '#fff1', borderColor: '#fff5', color: '#fff' }}>andén</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, padding: 18 }}>
          {/* opponent */}
          <div className="wf-col" style={{ alignItems: 'center', gap: 6 }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, border: `2px solid #fff`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: WF.hand, fontSize: 16 }}>@bea</div>
            <VoiceWave w={200} h={36} n={32} color={WF.accent} />
            <span className="wf-mono" style={{ fontSize: 10, color: '#fff8' }}>speaking…</span>
          </div>

          {/* divider */}
          <div style={{ height: 1, background: '#fff3', margin: '0 -20px' }} />

          {/* you */}
          <div className="wf-col" style={{ alignItems: 'center', gap: 6 }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, border: `2px solid #fff`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: WF.ink, fontFamily: WF.hand, fontSize: 16 }}>YOU</div>
            <VoiceWave w={200} h={28} n={32} color="#fff" active={false} />
            <span className="wf-mono" style={{ fontSize: 10, color: '#fff8' }}>listening · your turn next</span>
          </div>
        </div>

        <div className="wf-row" style={{ padding: '0 18px 18px', gap: 10, justifyContent: 'space-around' }}>
          {[['🔇','mute'],['💡','prompt'],['🚪','forfeit']].map(([i, l], k) => (
            <div key={k} className="wf-col" style={{ alignItems: 'center', gap: 4 }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, border: `1.5px solid #fff`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{i}</div>
              <span className="wf-mono" style={{ fontSize: 9, color: '#fff8' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

// ─── Live battle B: arena-style (game UI inspiration)
function S_LiveBattleB() {
  return (
    <Phone label="24b · Live Battle" sub="arena HUD · game-ish" accentBar>
      <div className="wf-col" style={{ height: '100%' }}>
        {/* HUD top */}
        <div className="wf-row" style={{ padding: '10px 14px', justifyContent: 'space-between', borderBottom: `1px solid ${WF.ink}22` }}>
          <div className="wf-col" style={{ gap: 2 }}>
            <span className="wf-mono" style={{ fontSize: 10 }}>YOU · 1247</span>
            <div style={{ width: 90, height: 6, border: `1px solid ${WF.ink}`, borderRadius: 3 }}>
              <div style={{ width: '72%', height: '100%', background: WF.accent2 }} />
            </div>
            <span className="wf-mono" style={{ fontSize: 8 }}>flow: strong</span>
          </div>
          <div className="wf-hand" style={{ fontSize: 28, color: WF.accent }}>02:14</div>
          <div className="wf-col" style={{ gap: 2, alignItems: 'flex-end' }}>
            <span className="wf-mono" style={{ fontSize: 10 }}>@bea · 1281</span>
            <div style={{ width: 90, height: 6, border: `1px solid ${WF.ink}`, borderRadius: 3 }}>
              <div style={{ width: '58%', height: '100%', background: WF.accent }} />
            </div>
            <span className="wf-mono" style={{ fontSize: 8, color: WF.muted }}>est. (Pro)</span>
          </div>
        </div>

        {/* Prompt + words */}
        <div style={{ padding: '8px 14px', background: WF.paper2, borderBottom: `1px solid ${WF.ink}22` }}>
          <div className="wf-mono" style={{ fontSize: 9, color: WF.ink3 }}>SCENARIO · TOURIST</div>
          <div className="wf-sans" style={{ fontSize: 11, lineHeight: 1.3 }}>
            Bus station. Last bus leaving. Worried tourist asking a local for help.
          </div>
        </div>

        <div className="wf-row" style={{ padding: '8px 14px', gap: 4, borderBottom: `1px solid ${WF.ink}22`, flexWrap: 'wrap' }}>
          <span className="wf-chip" style={{ background: WF.accent2, color: '#fff', border: 0 }}>✓ el último</span>
          <span className="wf-chip">perder</span>
          <span className="wf-chip">andén</span>
          <span className="wf-chip" style={{ background: WF.paper2 }}>qué fuerte</span>
          <span className="wf-mono" style={{ fontSize: 9, color: WF.muted, marginLeft: 'auto' }}>1/4 used</span>
        </div>

        {/* Combatants */}
        <div className="wf-col" style={{ padding: 14, gap: 12, flex: 1, justifyContent: 'center' }}>
          <div className="wf-row" style={{ gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, border: `2px solid ${WF.accent}` }} />
            <div className="wf-col" style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 12 }}>@bea_es · speaking</span>
              <VoiceWave w={180} h={28} n={28} color={WF.accent} />
            </div>
          </div>
          <div className="wf-row" style={{ gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: WF.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: WF.hand, fontSize: 14 }}>YOU</div>
            <div className="wf-col" style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 12 }}>You · muted listening</span>
              <VoiceWave w={180} h={20} n={28} active={false} />
            </div>
          </div>
        </div>

        <div className="wf-row" style={{ padding: 12, gap: 8, justifyContent: 'space-around', borderTop: `1px solid ${WF.ink}22` }}>
          <Btn>🔇 mute</Btn>
          <Btn primary>🎙 SPEAK</Btn>
          <Btn>💬 emote</Btn>
          <Btn danger size="s">🚪</Btn>
        </div>
      </div>
    </Phone>
  );
}

// ─── Conclude / processing
function S_Processing() {
  return (
    <Phone label="25 · Processing…" sub="server-side recording + grading">
      <div className="wf-col" style={{ height: '100%', padding: 22, gap: 14, alignItems: 'center', textAlign: 'center' }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>MATCH CONCLUDED · 03:00</div>
        <div className="wf-hand" style={{ fontSize: 32 }}>Grading…</div>

        <div className="wf-col" style={{ alignSelf: 'stretch', gap: 8, marginTop: 12 }}>
          {[
            { label: 'Agora cloud recording', state: 'done', detail: 'streams → R2' },
            { label: 'Toxicity scan',         state: 'done', detail: 'OK' },
            { label: 'ASR · whisper-small',   state: 'doing', detail: 'lite tier' },
            { label: 'DeepSeek referee',      state: 'pending', detail: 'ELO + feedback' },
            { label: 'Flashcard injection',   state: 'pending', detail: 'flagged words' },
          ].map((s, i) => (
            <div key={i} className="wf-row" style={{
              padding: 10, border: `1.5px solid ${WF.ink}`, borderRadius: 8, gap: 10,
              opacity: s.state === 'pending' ? 0.55 : 1,
              background: s.state === 'doing' ? WF.paper2 : WF.paper,
            }}>
              <span style={{ width: 16, fontFamily: WF.mono, fontSize: 12, color: s.state === 'done' ? WF.accent2 : s.state === 'doing' ? WF.accent : WF.muted }}>
                {s.state === 'done' ? '✓' : s.state === 'doing' ? '◐' : '○'}
              </span>
              <div className="wf-col" style={{ flex: 1, alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 600, fontSize: 12 }}>{s.label}</span>
                <span className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>{s.detail}</span>
              </div>
              {s.state === 'doing' && <span className="wf-mono" style={{ fontSize: 10, color: WF.accent }}>~14s</span>}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <div className="wf-anno" style={{ background: '#fff5d8', padding: 8, borderRadius: 6, alignSelf: 'stretch' }}>
          💡 free tier · 1 lite grading/day. Next match → ELO only unless you upgrade.
        </div>
        <Btn full>Wait here</Btn>
        <Btn primary full>Notify me when done →</Btn>
        <div className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>
          GET /matches/live/&#123;id&#125;/result · 404 while processing
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, { S_QueueA, S_QueueB, S_Matchmaking, S_Lobby, S_LiveBattle, S_LiveBattleB, S_Processing });
