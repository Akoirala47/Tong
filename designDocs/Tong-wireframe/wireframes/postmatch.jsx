// postmatch.jsx — Tong Post-Match VOD Review wireframes

// ─── Result screen (the big reveal)
function S_MatchResult() {
  return (
    <Phone label="26 · Match Result" sub="WIN / LOSS reveal">
      <div className="wf-col" style={{ height: '100%' }}>
        {/* hero band */}
        <div style={{ background: WF.accent2, color: '#fff', padding: '18px 16px', textAlign: 'center' }}>
          <div className="wf-mono" style={{ fontSize: 10, opacity: 0.8 }}>RANKED · ES · SOLO</div>
          <div className="wf-hand" style={{ fontSize: 48, lineHeight: 1 }}>VICTORY</div>
          <div className="wf-mono" style={{ fontSize: 12, marginTop: 4 }}>+18 ELO  ·  +85 XP</div>
        </div>

        <div className="wf-row" style={{ padding: 16, justifyContent: 'space-around', alignItems: 'center', background: WF.paper2 }}>
          <div className="wf-col" style={{ alignItems: 'center', gap: 2 }}>
            <RankBadge tier="SILVER" size={44} />
            <span style={{ fontWeight: 700, fontSize: 11 }}>YOU</span>
            <span className="wf-mono" style={{ fontSize: 11, color: WF.accent2 }}>+18 → 1265</span>
          </div>
          <div className="wf-hand" style={{ fontSize: 24 }}>vs</div>
          <div className="wf-col" style={{ alignItems: 'center', gap: 2 }}>
            <RankBadge tier="SILVER" size={44} />
            <span style={{ fontWeight: 700, fontSize: 11 }}>@bea_es</span>
            <span className="wf-mono" style={{ fontSize: 11, color: WF.accent }}>-15 → 1266</span>
          </div>
        </div>

        <div className="wf-col" style={{ padding: 14, gap: 10, flex: 1 }}>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>SCORECARD  (free · lite tier)</div>
          {[
            ['Prompt adherence', '88', '70'],
            ['Vocab complexity', '74', '69'],
            ['Words / min',      '112', '94'],
            ['Filler words',     '4', '9'],
          ].map(([k, you, opp], i) => (
            <div key={i} className="wf-row" style={{ gap: 6, alignItems: 'center' }}>
              <span className="wf-mono" style={{ fontSize: 10, width: 110 }}>{k}</span>
              <span className="wf-mono" style={{ fontSize: 10, width: 24, textAlign: 'right' }}>{you}</span>
              <div style={{ flex: 1, height: 10, position: 'relative', background: WF.paper2, borderRadius: 2 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', background: WF.accent2, opacity: 0.8 }} />
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '38%', background: WF.accent, opacity: 0.6 }} />
                <div style={{ position: 'absolute', top: -2, bottom: -2, left: '50%', width: 1, background: WF.ink }} />
              </div>
              <span className="wf-mono" style={{ fontSize: 10, width: 24, color: WF.muted }}>{opp}</span>
            </div>
          ))}

          <div className="wf-divider" style={{ marginTop: 4 }} />
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>SLANG / TARGET TRACK</div>
          <div className="wf-row" style={{ flexWrap: 'wrap', gap: 4 }}>
            <span className="wf-chip" style={{ background: WF.accent2, color: '#fff', border: 0 }}>✓ el último</span>
            <span className="wf-chip" style={{ background: WF.accent2, color: '#fff', border: 0 }}>✓ perder</span>
            <span className="wf-chip" style={{ background: WF.accent, color: '#fff', border: 0 }}>✗ andén</span>
            <span className="wf-chip" style={{ background: WF.accent, color: '#fff', border: 0 }}>✗ qué fuerte</span>
          </div>
        </div>

        <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Btn primary full size="l">VOD review →</Btn>
          <Btn full>Play again</Btn>
        </div>
      </div>
    </Phone>
  );
}

// ─── VOD review A: scrubbable transcript
function S_VODReview() {
  return (
    <Phone label="27a · VOD Review" sub="scrubbable transcript">
      <NavBar left="< Result" title="VOD · vs @bea_es" right="⤴" />
      {/* Audio scrubber */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${WF.ink}22` }}>
        <div className="wf-row" style={{ gap: 10, alignItems: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: WF.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</div>
          <div className="wf-col" style={{ flex: 1, gap: 2 }}>
            <div style={{ height: 22, position: 'relative', background: WF.paper2, borderRadius: 4 }}>
              <VoiceWave w={220} h={22} n={50} active={false} />
              <div style={{ position: 'absolute', top: -4, bottom: -4, left: '32%', width: 2, background: WF.accent }} />
            </div>
            <div className="wf-row" style={{ justifyContent: 'space-between' }}>
              <span className="wf-mono" style={{ fontSize: 9 }}>0:57</span>
              <span className="wf-mono" style={{ fontSize: 9 }}>3:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="wf-col" style={{ padding: '10px 14px', gap: 8, overflow: 'auto', flex: 1 }}>
        {[
          { who: 'bea',  t: '¡Disculpa! Necesito el último bus al pueblo.', ts: '0:08', notes: [] },
          { who: 'you',  t: 'Ahh… espera, ¿el último cuándo voy?', ts: '0:14', notes: [
            { type: 'grammar', span: 'cuándo voy', tip: 'should be "cuándo va" (formal)' },
          ]},
          { who: 'bea',  t: 'A las nueve. ¡Quedan diez minutos!', ts: '0:22', notes: [] },
          { who: 'you',  t: '¡Qué fuert—! Eh… ¿dónde está el andén?', ts: '0:30', notes: [
            { type: 'pron', span: 'andén', tip: 'stress on -dén · listen ▶' },
            { type: 'filler', span: 'Eh…', tip: 'filler · drilling tip in flashcards' },
          ]},
          { who: 'bea',  t: 'El número cuatro, allá al fondo.',         ts: '0:36', notes: [] },
        ].map((line, i) => (
          <div key={i} className="wf-col" style={{ gap: 4, alignItems: line.who === 'you' ? 'flex-end' : 'flex-start' }}>
            <div className="wf-row" style={{ gap: 6 }}>
              <span className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>{line.ts}</span>
              <span className="wf-mono" style={{ fontSize: 9, color: line.who === 'you' ? WF.accent2 : WF.ink3 }}>{line.who === 'you' ? 'you' : '@bea'}</span>
            </div>
            <div className="wf-box" style={{
              padding: 8, borderRadius: 8, maxWidth: '88%',
              background: line.who === 'you' ? WF.paper2 : WF.paper,
              borderColor: line.notes.length ? WF.accent : WF.ink,
            }}>
              <span className="wf-sans" style={{ fontSize: 12, lineHeight: 1.4 }}>{line.t}</span>
              {line.notes.map((n, j) => (
                <div key={j} style={{ marginTop: 6, padding: 6, background: '#fff5d8', borderRadius: 4 }}>
                  <span className="wf-mono" style={{ fontSize: 9, color: WF.accent, fontWeight: 700 }}>{n.type.toUpperCase()}</span>
                  <span className="wf-mono" style={{ fontSize: 10 }}> · {n.span}</span>
                  <div className="wf-anno" style={{ marginTop: 2 }}>{n.tip}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="wf-anno" style={{ textAlign: 'center', color: WF.muted, padding: 8 }}>
          Pro+: words-per-minute heatmap on hover · Elite: phoneme overlay
        </div>
      </div>

      <div style={{ padding: '8px 14px', borderTop: `1px solid ${WF.ink}22`, display: 'flex', gap: 8 }}>
        <Btn full>Save clip</Btn>
        <Btn primary full>Drill weak words (4) →</Btn>
      </div>
    </Phone>
  );
}

// ─── VOD review B: tier paywall view (free user)
function S_VODPaywall() {
  return (
    <Phone label="27b · VOD · Locked" sub="2nd match of day = ELO-only">
      <NavBar left="< Result" title="VOD · vs @raul_es" right="" />
      <div className="wf-col" style={{ padding: 18, gap: 14, height: '100%', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginTop: 8 }}>🔒</div>
        <div className="wf-hand" style={{ fontSize: 26 }}>No transcript for this one.</div>
        <div className="wf-anno" style={{ maxWidth: 240 }}>
          You used your 1 free <b>lite</b> grading earlier today. Subsequent matches return ELO + win/loss only.
        </div>

        <div className="wf-box" style={{ alignSelf: 'stretch', padding: 12, borderRadius: 10 }}>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>WHAT YOU MISSED</div>
          <div className="wf-col" style={{ gap: 4, marginTop: 4, alignItems: 'flex-start', textAlign: 'left' }}>
            <span className="wf-anno">· transcript & timestamps</span>
            <span className="wf-anno">· filler-word & pronunciation flags</span>
            <span className="wf-anno">· flashcard auto-injection of misused words</span>
          </div>
        </div>

        <div className="wf-col" style={{ alignSelf: 'stretch', gap: 8 }}>
          {[
            { name: 'Plus',  p: '$9.99',  feat: 'no ads · lite on every match' },
            { name: 'Pro',   p: '$15.99', feat: 'full Qwen + DeepSeek · unlimited', highlight: true },
            { name: 'Elite', p: '$19.99', feat: 'Whisper-turbo · phoneme analysis' },
          ].map((t, i) => (
            <div key={i} className="wf-row" style={{
              padding: 10, border: `1.5px solid ${t.highlight ? WF.accent : WF.ink}`, borderRadius: 8,
              background: t.highlight ? '#fdeae3' : WF.paper, justifyContent: 'space-between',
            }}>
              <div className="wf-col" style={{ alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, fontSize: 12 }}>{t.name}{t.highlight && ' · most popular'}</span>
                <span className="wf-anno">{t.feat}</span>
              </div>
              <span className="wf-mono" style={{ fontSize: 11 }}>{t.p}/mo</span>
            </div>
          ))}
        </div>

        <Btn primary full size="l">Upgrade → unlock VOD</Btn>
        <Btn full size="s">Maybe later</Btn>
      </div>
    </Phone>
  );
}

Object.assign(window, { S_MatchResult, S_VODReview, S_VODPaywall });
