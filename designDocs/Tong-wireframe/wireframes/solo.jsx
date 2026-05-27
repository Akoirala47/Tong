// solo.jsx — Tong Solo Grind wireframes (tier map, lessons, cards, flashcards, boss)

// ─── Tier map A: vertical path (Duolingo-ish but ranked)
function S_TierMapA() {
  const tiers = [
    { t: 'BRONZE',  done: true,  curr: false },
    { t: 'SILVER',  done: false, curr: true  },
    { t: 'GOLD',    done: false, curr: false },
    { t: 'PLAT',    done: false, curr: false },
  ];
  return (
    <Phone label="08a · Tier Map" sub="vertical path">
      <NavBar left="< Home" title="Solo Grind — ES" right="🔥 12" />
      <div className="wf-col" style={{ padding: '8px 16px', gap: 4 }}>
        <div className="wf-row" style={{ justifyContent: 'space-between' }}>
          <span className="wf-mono" style={{ fontSize: 11 }}>SILVER II · Ch 4/8</span>
          <span className="wf-mono" style={{ fontSize: 11, color: WF.muted }}>52% to Gold</span>
        </div>
        <div style={{ height: 4, background: WF.ink + '22' }}><div style={{ width: '52%', height: 4, background: WF.accent }} /></div>
      </div>
      <div className="wf-col" style={{ padding: '6px 0', gap: 8, overflow: 'auto', flex: 1 }}>
        {tiers.map((tt, i) => (
          <div key={i} className="wf-col" style={{ padding: '6px 16px', gap: 6 }}>
            <div className="wf-row" style={{ gap: 8 }}>
              <RankBadge tier={tt.t} size={36} />
              <div className="wf-col" style={{ gap: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{tt.t}{tt.curr ? ' · current' : tt.done ? ' · cleared' : ' · locked'}</span>
                <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>CEFR {['A1','A2','B1','B2'][i]}</span>
              </div>
            </div>
            {/* lessons row */}
            <div className="wf-row" style={{ gap: 4, paddingLeft: 44, flexWrap: 'wrap' }}>
              {[1,2,3,4,5,6,7,8].map((n) => {
                const done = tt.done || (tt.curr && n < 4);
                const curr = tt.curr && n === 4;
                const locked = !tt.done && !tt.curr;
                return (
                  <div key={n} style={{
                    width: 28, height: 28, borderRadius: 14,
                    border: `1.5px solid ${locked ? WF.muted : WF.ink}`,
                    background: done ? WF.ink : curr ? WF.accent : 'transparent',
                    color: done || curr ? '#fff' : (locked ? WF.muted : WF.ink),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: WF.sans, fontWeight: 600, fontSize: 11,
                    boxShadow: curr ? `0 0 0 4px ${WF.accent}33` : 'none',
                  }}>{done ? '✓' : n}</div>
                );
              })}
              {/* Boss node */}
              <div style={{
                width: 32, height: 32, borderRadius: 6,
                border: `2px solid ${tt.curr ? WF.accent : WF.muted}`,
                background: tt.done ? WF.ink : 'transparent',
                color: tt.done ? '#fff' : (tt.curr ? WF.accent : WF.muted),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: WF.sans, fontWeight: 700, fontSize: 14,
              }}>👑</div>
            </div>
            {i < tiers.length - 1 && <div style={{ marginLeft: 60, width: 2, height: 18, background: WF.ink, opacity: 0.3 }} />}
          </div>
        ))}
      </div>
      <TabBar active="solo" />
    </Phone>
  );
}

// ─── Tier map B: skill tree / dependency graph (novel)
function S_TierMapB() {
  return (
    <Phone label="08b · Tier Map" sub="skill-tree variant">
      <NavBar left="< Home" title="Skill graph — ES · Silver" right="?" />
      <div style={{ position: 'relative', height: 'calc(100% - 80px)', overflow: 'hidden', background: WF.paper2 }}>
        <svg width="320" height="500" viewBox="0 0 320 500" style={{ position: 'absolute', inset: 0 }}>
          {/* edges */}
          {[
            [60,60, 160,120], [160,60, 160,120], [260,60, 160,120],
            [160,120, 100,200], [160,120, 220,200],
            [100,200, 160,280], [220,200, 160,280],
            [160,280, 80,360], [160,280, 240,360],
            [80,360, 160,440], [240,360, 160,440],
          ].map(([x1,y1,x2,y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={WF.ink} strokeWidth="1.5" opacity="0.4" strokeDasharray="3 3" />
          ))}
          {/* nodes */}
          {[
            { x: 60, y: 60, label: 'PRESENT', d: true },
            { x: 160, y: 60, label: 'NUMBERS', d: true },
            { x: 260, y: 60, label: 'GREET', d: true },
            { x: 160, y: 120, label: 'PRETERIT', d: true, curr: true },
            { x: 100, y: 200, label: 'IRREG-V', d: false, curr: false, focus: true },
            { x: 220, y: 200, label: 'IMPERF.', d: false },
            { x: 160, y: 280, label: 'PRON.', d: false, locked: true },
            { x: 80,  y: 360, label: 'SUBJ.', d: false, locked: true },
            { x: 240, y: 360, label: 'COND.', d: false, locked: true },
            { x: 160, y: 440, label: '👑 BOSS', boss: true },
          ].map((n, i) => (
            <g key={i} transform={`translate(${n.x - 40},${n.y - 18})`}>
              <rect width="80" height="36" rx="6"
                fill={n.boss ? WF.paper : n.d ? WF.ink : n.focus ? WF.accent : WF.paper}
                stroke={n.boss ? WF.accent : n.locked ? WF.muted : WF.ink}
                strokeWidth={n.boss ? 2 : n.focus ? 2 : 1.5}
                strokeDasharray={n.locked ? '3 3' : 'none'} />
              <text x="40" y="22" textAnchor="middle"
                fontFamily={WF.sans} fontWeight="600" fontSize="11"
                fill={n.d ? '#fff' : n.focus ? '#fff' : n.locked ? WF.muted : WF.ink}>{n.label}</text>
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', bottom: 8, left: 12, right: 12 }}>
          <Btn primary full size="l">Tap node to start lesson</Btn>
        </div>
      </div>
      <TabBar active="solo" />
    </Phone>
  );
}

// ─── Lesson intro
function S_LessonIntro() {
  return (
    <Phone label="09 · Lesson Intro">
      <NavBar left="✕" title="" right="" />
      <div className="wf-col" style={{ padding: 20, gap: 14, height: '100%' }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>SILVER · CHAPTER 4 · LESSON 2</div>
        <div className="wf-hand" style={{ fontSize: 36, lineHeight: 1 }}>Past tense:<br />irregular verbs</div>
        <div className="wf-anno">~6 min · 12 cards · 60 XP target</div>
        <div className="wf-col" style={{ gap: 6, marginTop: 6 }}>
          <span className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>YOU'LL TRAIN</span>
          {['ser → fui', 'ir → fui', 'tener → tuve', 'hacer → hice'].map((w, i) => (
            <div key={i} className="wf-row" style={{ gap: 8 }}>
              <span className="wf-chip">{w}</span>
              <span className="wf-anno">used in 6 of your last 10 matches</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Btn primary full size="l">Start lesson</Btn>
        <div className="wf-mono" style={{ fontSize: 9, color: WF.muted, textAlign: 'center' }}>
          POST /lessons/&#123;id&#125;/start
        </div>
      </div>
    </Phone>
  );
}

// ─── Exercise card: translate (text input)
function S_CardTranslate() {
  return (
    <Phone label="10a · Card · Translate">
      <NavBar left="✕" title="" right="3 / 12" />
      <div style={{ height: 4, background: WF.ink + '22', margin: '0 16px' }}>
        <div style={{ width: '25%', height: 4, background: WF.accent2 }} />
      </div>
      <div className="wf-col" style={{ padding: 20, gap: 14, height: '100%' }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>TRANSLATE TO ES</div>
        <div className="wf-hand" style={{ fontSize: 26, lineHeight: 1.15 }}>
          "Yesterday I went<br />to the market."
        </div>
        <div className="wf-anno">tap a word to hear it · Fish S2 cached</div>
        <Placeholder h={64} style={{ alignItems: 'flex-start', justifyContent: 'flex-start', padding: 10 }}>
          ayer fui al mercado
        </Placeholder>
        <div className="wf-row" style={{ flexWrap: 'wrap', gap: 6 }}>
          {['ayer','fui','al','mercado','tienda','voy','hoy','ir'].map((w, i) => (
            <span key={i} className="wf-chip" style={{ padding: '5px 10px', fontSize: 12, opacity: i < 4 ? 0.4 : 1 }}>{w}</span>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Btn primary full size="l">Check</Btn>
        <div className="wf-mono" style={{ fontSize: 9, color: WF.muted, textAlign: 'center' }}>
          POST /cards/&#123;id&#125;/answer · wrong → flashcard inject
        </div>
      </div>
    </Phone>
  );
}

// ─── Exercise card: audio match
function S_CardAudio() {
  return (
    <Phone label="10b · Card · Listen">
      <NavBar left="✕" title="" right="5 / 12" />
      <div style={{ height: 4, background: WF.ink + '22', margin: '0 16px' }}>
        <div style={{ width: '42%', height: 4, background: WF.accent2 }} />
      </div>
      <div className="wf-col" style={{ padding: 20, gap: 12, height: '100%' }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>WHAT DID YOU HEAR?</div>
        <div className="wf-col" style={{ alignItems: 'center', gap: 8, padding: '16px 0' }}>
          <div style={{
            width: 76, height: 76, borderRadius: 38, border: `2px solid ${WF.ink}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            background: WF.paper2,
          }}>▶</div>
          <VoiceWave w={200} h={28} n={36} />
          <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>0:00 / 0:03 · 0.7× slow</span>
        </div>
        <div className="wf-col" style={{ gap: 8 }}>
          {['Tuve mucha hambre.', 'Tengo mucha hambre.', 'Tuvo mucha hambre.', 'Tendría hambre.'].map((t, i) => (
            <div key={i} style={{
              padding: '10px 12px', border: `1.5px solid ${WF.ink}`, borderRadius: 8,
              fontFamily: WF.sans, fontSize: 13,
            }}>{String.fromCharCode(65 + i)}.  {t}</div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

// ─── Exercise card: speak (record · MVP audio not graded live, but card type exists)
function S_CardSpeak() {
  return (
    <Phone label="10c · Card · Speak" sub="experimental — defers to post-match grading">
      <NavBar left="✕" title="" right="9 / 12" />
      <div style={{ height: 4, background: WF.ink + '22', margin: '0 16px' }}>
        <div style={{ width: '75%', height: 4, background: WF.accent2 }} />
      </div>
      <div className="wf-col" style={{ padding: 20, gap: 14, height: '100%' }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>SAY IT OUT LOUD</div>
        <div className="wf-hand" style={{ fontSize: 26, lineHeight: 1.15 }}>
          "I had to leave<br />earlier than expected."
        </div>
        <div className="wf-anno">target words: <span className="wf-chip">tuve</span><span className="wf-chip">salir</span><span className="wf-chip">esperaba</span></div>
        <div className="wf-col" style={{ alignItems: 'center', gap: 10, padding: '20px 0' }}>
          <div style={{
            width: 92, height: 92, borderRadius: 46,
            border: `3px solid ${WF.accent}`, background: WF.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 32,
          }}>🎙</div>
          <VoiceWave w={200} h={28} n={36} color={WF.accent} />
          <span className="wf-mono" style={{ fontSize: 10 }}>recording · 0:02 / 0:10</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="wf-row" style={{ gap: 8 }}>
          <Btn full>Retry</Btn>
          <Btn primary full>Submit</Btn>
        </div>
        <div className="wf-mono" style={{ fontSize: 9, color: WF.muted, textAlign: 'center' }}>
          MVP: client local STT for hint only; full grading happens in PvP pipeline
        </div>
      </div>
    </Phone>
  );
}

// ─── Card answer feedback (correct / wrong)
function S_CardFeedback() {
  return (
    <Phone label="11 · Card · Wrong" sub="error injection in action">
      <div className="wf-col" style={{ height: '100%' }}>
        <div style={{ flex: 1, padding: 20, opacity: 0.4 }}>
          <div className="wf-mono" style={{ fontSize: 10 }}>TRANSLATE</div>
          <div className="wf-hand" style={{ fontSize: 22 }}>"Yesterday I went to the market."</div>
          <Placeholder h={40} style={{ marginTop: 12 }}>ayer voy al mercado</Placeholder>
        </div>
        <div style={{
          background: '#fdeae3', borderTop: `2px solid ${WF.accent}`, padding: 16,
        }}>
          <div className="wf-row" style={{ gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 22, color: WF.accent }}>✗</span>
            <div className="wf-col" style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: WF.accent }}>Not quite</span>
              <span className="wf-anno">correct: <b>ayer fui al mercado</b></span>
              <span className="wf-anno">past-tense: <b>fui</b> not <b>voy</b></span>
            </div>
          </div>
          <div className="wf-anno" style={{ background: WF.paper, padding: 8, borderRadius: 6, marginTop: 8 }}>
            🃏 <b>fui</b> added to your flashcard deck — see you again tomorrow.
          </div>
          <Btn primary full size="l" style={{ marginTop: 10 }}>Got it →</Btn>
        </div>
      </div>
    </Phone>
  );
}

// ─── Lesson summary
function S_LessonSummary() {
  return (
    <Phone label="12 · Lesson Summary">
      <NavBar left="" title="" right="✕" />
      <div className="wf-col" style={{ padding: 20, gap: 12, alignItems: 'center', textAlign: 'center', height: '100%' }}>
        <div className="wf-hand" style={{ fontSize: 40 }}>Lesson done.</div>
        <div className="wf-row" style={{ gap: 18, padding: '8px 0' }}>
          <div className="wf-col" style={{ alignItems: 'center' }}>
            <div className="wf-hand" style={{ fontSize: 30, color: WF.accent2 }}>10/12</div>
            <div className="wf-mono" style={{ fontSize: 10 }}>correct</div>
          </div>
          <div className="wf-col" style={{ alignItems: 'center' }}>
            <div className="wf-hand" style={{ fontSize: 30 }}>+58</div>
            <div className="wf-mono" style={{ fontSize: 10 }}>XP</div>
          </div>
          <div className="wf-col" style={{ alignItems: 'center' }}>
            <div className="wf-hand" style={{ fontSize: 30, color: WF.accent }}>2</div>
            <div className="wf-mono" style={{ fontSize: 10 }}>→ flashcards</div>
          </div>
        </div>
        <div className="wf-divider" style={{ alignSelf: 'stretch' }} />
        <div className="wf-col" style={{ alignSelf: 'stretch', gap: 6 }}>
          <div className="wf-mono" style={{ fontSize: 10, textAlign: 'left', color: WF.ink3 }}>WEAK SPOTS</div>
          {[['fui vs voy', 'mixed up tense'], ['tuve', 'forgot the spelling']].map(([w, why], i) => (
            <div key={i} className="wf-row" style={{ justifyContent: 'space-between', padding: 8, border: `1.5px dashed ${WF.dashed}`, borderRadius: 6 }}>
              <span className="wf-mono" style={{ fontSize: 11 }}>{w}</span>
              <span className="wf-anno">{why}</span>
            </div>
          ))}
        </div>
        <div className="wf-anno" style={{ background: '#fff5d8', padding: 8, borderRadius: 6, color: '#5a4a14', alignSelf: 'stretch' }}>
          📺 free tier · interstitial ad next (Plus removes)
        </div>
        <div style={{ flex: 1 }} />
        <Btn primary full size="l">Next lesson →</Btn>
        <Btn full>Practice flashcards instead</Btn>
      </div>
    </Phone>
  );
}

// ─── Flashcards: swipe deck
function S_Flashcards() {
  return (
    <Phone label="13 · Flashcards" sub="rapid swipe">
      <NavBar left="✕" title="" right="23 due · 8 left" />
      <div className="wf-col" style={{ padding: 20, gap: 10, height: '100%', alignItems: 'center' }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>FROM LIVE MATCH vs @kenta · 2d ago</div>
        <div style={{ position: 'relative', width: 240, height: 320, marginTop: 10 }}>
          {/* back card stack */}
          <div style={{ position: 'absolute', inset: 0, transform: 'translate(8px, 8px) rotate(2deg)', background: WF.paper2, border: `1.5px solid ${WF.ink}`, borderRadius: 14 }} />
          <div style={{ position: 'absolute', inset: 0, transform: 'translate(4px, 4px) rotate(-1deg)', background: WF.paper2, border: `1.5px solid ${WF.ink}`, borderRadius: 14 }} />
          {/* top card */}
          <div className="wf-box" style={{
            position: 'absolute', inset: 0, borderRadius: 14, padding: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>VERB · IRREG · PRET.</div>
            <div className="wf-col" style={{ alignItems: 'center', gap: 4 }}>
              <div className="wf-hand" style={{ fontSize: 48 }}>fui</div>
              <div className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>tap to flip · ser/ir past 1st</div>
              <div style={{ marginTop: 8, padding: '6px 8px', border: `1px solid ${WF.ink}22`, borderRadius: 6, fontFamily: WF.mono, fontSize: 10, color: WF.ink3 }}>
                "Ayer <b>fui</b> al mercado."
              </div>
            </div>
            <div className="wf-row" style={{ justifyContent: 'space-between' }}>
              <span className="wf-mono" style={{ fontSize: 10 }}>‹ Hard (1d)</span>
              <span className="wf-mono" style={{ fontSize: 10 }}>Easy (4d) ›</span>
            </div>
          </div>
        </div>
        <div className="wf-row" style={{ gap: 8, marginTop: 14 }}>
          <Btn>👎 Again</Btn>
          <Btn>Hard</Btn>
          <Btn primary>Good</Btn>
          <Btn>Easy</Btn>
        </div>
        <div style={{ flex: 1 }} />
        <div className="wf-anno" style={{ textAlign: 'center', color: WF.muted }}>
          SM-2 spaced repetition · queue ingests from M-02 + M-08 referee
        </div>
      </div>
    </Phone>
  );
}

// ─── Boss Battle entry
function S_BossEntry() {
  return (
    <Phone label="14 · Boss Battle Entry" accentBar>
      <NavBar left="< Back" title="Boss Battle" right="" accent />
      <div className="wf-col" style={{ padding: 20, gap: 14, alignItems: 'center', height: '100%' }}>
        <div style={{ fontSize: 60, marginTop: 6 }}>👑</div>
        <div className="wf-hand" style={{ fontSize: 32 }}>Silver → Gold</div>
        <div className="wf-anno" style={{ textAlign: 'center', maxWidth: 240 }}>
          One shot. 20 questions. 4 minutes. ≥80% to break rank. Fail and you keep Silver — try again tomorrow.
        </div>
        <div className="wf-col" style={{ alignSelf: 'stretch', gap: 6 }}>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>YOU'LL FACE</div>
          {[
            ['Past tense (preterite/imperfect)', '✓ ready'],
            ['Irregular verbs (top-30)', '⚠ 2 weak'],
            ['Ordering at a restaurant', '✓ ready'],
            ['Phone conversation flow',   '✗ untouched'],
          ].map(([t, s], i) => (
            <div key={i} className="wf-row" style={{ justifyContent: 'space-between', padding: 8, border: `1.5px dashed ${WF.dashed}`, borderRadius: 6 }}>
              <span className="wf-mono" style={{ fontSize: 11 }}>{t}</span>
              <span className="wf-mono" style={{ fontSize: 10, color: s.startsWith('✓') ? WF.accent2 : s.startsWith('⚠') ? WF.warn : WF.accent }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Btn danger full size="l">Fight Boss</Btn>
        <Btn full>Drill weak spots first</Btn>
      </div>
    </Phone>
  );
}

// ─── Boss Battle gameplay
function S_BossPlay() {
  return (
    <Phone label="15 · Boss Battle · Active" accentBar dark>
      <div className="wf-col" style={{ height: '100%', color: '#fff' }}>
        <div className="wf-row" style={{ padding: '10px 16px', justifyContent: 'space-between' }}>
          <span className="wf-mono" style={{ fontSize: 10, color: '#fff' }}>Q 12 / 20</span>
          <span className="wf-mono" style={{ fontSize: 12, color: WF.accent }}>⏱ 02:14</span>
          <span className="wf-mono" style={{ fontSize: 10, color: '#fff' }}>♥ ♥ ♥</span>
        </div>
        <div style={{ height: 4, background: '#fff2', margin: '0 16px' }}>
          <div style={{ width: '60%', height: 4, background: WF.accent }} />
        </div>
        <div className="wf-col" style={{ padding: 20, gap: 14, flex: 1 }}>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.accent }}>FILL THE BLANK</div>
          <div className="wf-hand" style={{ fontSize: 26, color: '#fff', lineHeight: 1.2 }}>
            "Ayer ___<br />al mercado<br />temprano."
          </div>
          <div className="wf-col" style={{ gap: 6, marginTop: 6 }}>
            {['fui', 'voy', 'iba', 'había ido'].map((t, i) => (
              <div key={i} style={{
                padding: '10px 12px', border: `1.5px solid #fff`, borderRadius: 8,
                color: '#fff', fontFamily: WF.sans, fontSize: 13,
                background: 'transparent',
              }}>{String.fromCharCode(65 + i)}.  {t}</div>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div className="wf-anno" style={{ color: '#fff8', textAlign: 'center' }}>
            wrong answer = -1 ♥ · 0 ♥ left = boss fails
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ─── Boss Battle result (promoted / failed)
function S_BossResult() {
  return (
    <Phone label="16 · Boss Result · Promoted!">
      <div className="wf-col" style={{ height: '100%', padding: 20, gap: 14, alignItems: 'center', textAlign: 'center' }}>
        <div className="wf-hand" style={{ fontSize: 40, color: WF.accent2, marginTop: 16 }}>RANK UP</div>
        <div className="wf-row" style={{ gap: 18, alignItems: 'center' }}>
          <RankBadge tier="SILVER" size={56} />
          <span style={{ fontSize: 30 }}>→</span>
          <RankBadge tier="GOLD" size={80} />
        </div>
        <div className="wf-mono" style={{ fontSize: 12 }}>Silver II  →  GOLD I · 1500 ELO</div>
        <div className="wf-divider" style={{ alignSelf: 'stretch' }} />
        <div className="wf-col" style={{ alignSelf: 'stretch', gap: 4 }}>
          {[
            ['Boss score',  '18 / 20'],
            ['Time used',   '03:42 / 4:00'],
            ['Hearts left', '2 / 3'],
            ['Bonus XP',    '+200'],
          ].map(([k, v], i) => (
            <div key={i} className="wf-row" style={{ justifyContent: 'space-between' }}>
              <span className="wf-anno">{k}</span>
              <span className="wf-mono" style={{ fontSize: 11 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="wf-anno" style={{ background: WF.paper2, padding: 10, borderRadius: 6, alignSelf: 'stretch', textAlign: 'left' }}>
          <b>What unlocks:</b> Gold lessons (Ch 1-8), Gold MMR queue, "Gold I" rank border on profile, 1 dynamic banner.
        </div>
        <div style={{ flex: 1 }} />
        <Btn primary full size="l">Explore Gold lessons</Btn>
        <Btn full>Queue ranked at new rank</Btn>
      </div>
    </Phone>
  );
}

Object.assign(window, {
  S_TierMapA, S_TierMapB, S_LessonIntro,
  S_CardTranslate, S_CardAudio, S_CardSpeak, S_CardFeedback,
  S_LessonSummary, S_Flashcards, S_BossEntry, S_BossPlay, S_BossResult,
});
