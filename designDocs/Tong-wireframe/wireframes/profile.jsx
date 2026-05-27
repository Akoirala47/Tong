// profile.jsx — Tong Profile / Leaderboards / Subscription / Settings wireframes

// ─── Profile A: public-facing
function S_Profile() {
  return (
    <Phone label="28 · Profile" sub="public · own view">
      <NavBar left="< Home" title="@alex_es" right="⚙" />
      <div className="wf-col" style={{ overflow: 'auto', flex: 1 }}>
        {/* Banner */}
        <div style={{ height: 76, background: `linear-gradient(135deg, ${WF.accent}, ${WF.ink})`, position: 'relative' }}>
          <div className="wf-mono" style={{ position: 'absolute', top: 8, right: 12, color: '#fff', fontSize: 9, opacity: 0.7 }}>SEASON 1 BANNER</div>
        </div>
        <div className="wf-row" style={{ padding: '0 14px', marginTop: -28, gap: 12, alignItems: 'flex-end' }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: WF.paper2, border: `2.5px solid ${WF.paper}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: WF.hand, fontSize: 22 }}>A</div>
          <div className="wf-col" style={{ flex: 1, paddingBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Alex · @alex_es</span>
            <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>SF · learning 🇪🇸 · day 12 streak 🔥</span>
          </div>
        </div>

        {/* Rank card */}
        <div style={{ padding: 14 }}>
          <div className="wf-box" style={{ padding: 12, borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <RankBadge tier="SILVER" size={56} />
            <div className="wf-col" style={{ flex: 1, gap: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Silver II · 1247</span>
              <div style={{ height: 4, background: WF.ink + '22', borderRadius: 2 }}>
                <div style={{ width: '52%', height: 4, background: WF.accent }} />
              </div>
              <span className="wf-mono" style={{ fontSize: 10, color: WF.muted }}>253 to GOLD I</span>
            </div>
            <div className="wf-col" style={{ alignItems: 'flex-end' }}>
              <span className="wf-mono" style={{ fontSize: 10, color: WF.accent2 }}>+18 wk</span>
              <span className="wf-mono" style={{ fontSize: 10 }}>56% WR</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="wf-row" style={{ padding: '0 14px', gap: 8 }}>
          {[
            ['142', 'matches'],
            ['4820', 'XP'],
            ['12', 'streak'],
            ['38', 'duels'],
          ].map(([v, l], i) => (
            <div key={i} className="wf-col" style={{ flex: 1, alignItems: 'center', padding: 8, border: `1px solid ${WF.ink}22`, borderRadius: 6 }}>
              <span className="wf-hand" style={{ fontSize: 20 }}>{v}</span>
              <span className="wf-mono" style={{ fontSize: 9, color: WF.muted }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Recent match history */}
        <div style={{ padding: '14px 14px 4px' }}>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>RECENT</div>
        </div>
        <div className="wf-col" style={{ padding: '0 14px', gap: 4 }}>
          {[
            { r: 'W', op: '@bea_es',  d: '+18', kind: 'LIVE' },
            { r: 'W', op: '@kenta_ja', d: '+4', kind: 'DUEL' },
            { r: 'L', op: '@sara_es', d: '-12', kind: 'LIVE' },
            { r: 'W', op: '@dan_fr',  d: '+3', kind: 'DUEL' },
            { r: 'L', op: '@luis_es', d: '-9', kind: 'LIVE' },
          ].map((m, i) => (
            <div key={i} className="wf-row" style={{ padding: 6, borderRadius: 4, gap: 8, background: i % 2 ? WF.paper2 : 'transparent' }}>
              <span style={{ width: 16, height: 16, borderRadius: 3, background: m.r === 'W' ? WF.accent2 : WF.accent, color: '#fff', fontFamily: WF.mono, fontSize: 10, textAlign: 'center', lineHeight: '16px', fontWeight: 700 }}>{m.r}</span>
              <span className="wf-mono" style={{ fontSize: 11 }}>{m.op}</span>
              <span className="wf-chip" style={{ marginLeft: 'auto', fontSize: 9 }}>{m.kind}</span>
              <span className="wf-mono" style={{ fontSize: 10, width: 40, textAlign: 'right', color: m.r === 'W' ? WF.accent2 : WF.accent }}>{m.d}</span>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{ padding: '14px 14px 4px' }}>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>BADGES · 4 / 26</div>
        </div>
        <div className="wf-row" style={{ padding: '0 14px 14px', gap: 8, flexWrap: 'wrap' }}>
          {['🔥','👑','⚡','🎙','🃏','🌟','💀','🥇'].map((b, i) => (
            <div key={i} style={{
              width: 38, height: 38, borderRadius: 8, border: `1.5px solid ${WF.ink}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              opacity: i < 4 ? 1 : 0.3, background: i < 4 ? WF.paper2 : 'transparent',
            }}>{b}</div>
          ))}
        </div>
      </div>
      <TabBar active="me" />
    </Phone>
  );
}

// ─── Leaderboard
function S_Leaderboard() {
  const rows = [
    { rk: 1,  who: '@kenta_ja', elo: 2410, tier: 'MASTER', delta: '+42' },
    { rk: 2,  who: '@maria_x',  elo: 2280, tier: 'DIAM',   delta: '+18' },
    { rk: 3,  who: '@li_xi',    elo: 2102, tier: 'DIAM',   delta: '+11' },
    { rk: 47, who: '@you',      elo: 1247, tier: 'SILVER', delta: '+18', me: true },
    { rk: 48, who: '@dan_fr',   elo: 1245, tier: 'SILVER', delta: '-12' },
    { rk: 49, who: '@nina_jp',  elo: 1240, tier: 'SILVER', delta: '+0'  },
  ];
  return (
    <Phone label="29 · Leaderboard">
      <NavBar left="< Profile" title="Leaderboards" right="ℹ" />
      <div className="wf-row" style={{ padding: '8px 14px', gap: 6 }}>
        <span className="wf-pill wf-pill-fill">Weekly</span>
        <span className="wf-pill">All-time</span>
        <span className="wf-pill">Solo XP</span>
      </div>
      <div className="wf-row" style={{ padding: '0 14px 8px', gap: 6 }}>
        <span className="wf-pill wf-pill-fill">Global</span>
        <span className="wf-pill">Region</span>
        <span className="wf-pill">Friends</span>
      </div>
      <div className="wf-col" style={{ padding: '0 14px', gap: 2, flex: 1, overflow: 'auto' }}>
        {rows.map((r, i) => (
          <div key={i} className="wf-row" style={{
            padding: 8, gap: 8, alignItems: 'center', borderRadius: 6,
            background: r.me ? '#fdeae3' : (i % 2 ? WF.paper2 : 'transparent'),
            border: r.me ? `1.5px solid ${WF.accent}` : `1px solid transparent`,
          }}>
            <span className="wf-mono" style={{ fontSize: 11, width: 32, color: r.me ? WF.accent : WF.ink, fontWeight: 700 }}>#{r.rk}</span>
            <RankBadge tier={r.tier} size={24} />
            <span style={{ fontFamily: WF.sans, fontWeight: r.me ? 700 : 500, fontSize: 12, flex: 1 }}>{r.who}</span>
            <span className="wf-mono" style={{ fontSize: 11 }}>{r.elo}</span>
            <span className="wf-mono" style={{ fontSize: 10, width: 36, textAlign: 'right', color: r.delta.startsWith('+') ? WF.accent2 : (r.delta.startsWith('-') ? WF.accent : WF.muted) }}>{r.delta}</span>
          </div>
        ))}
        <div className="wf-anno" style={{ marginTop: 8, color: WF.muted, textAlign: 'center' }}>
          Cached top 100 · own row injected if outside · 30s refresh
        </div>
      </div>
      <TabBar active="me" />
    </Phone>
  );
}

// ─── Subscription tiers
function S_Subscription() {
  return (
    <Phone label="30 · Subscription">
      <NavBar left="< Profile" title="Tong Tiers" right="?" />
      <div className="wf-col" style={{ padding: 14, gap: 10, overflow: 'auto' }}>
        <div className="wf-anno" style={{ background: WF.paper2, padding: 8, borderRadius: 6 }}>
          You pay for <b>analysis depth</b>, never for the ability to speak. All tiers can queue ranked.
        </div>

        {[
          {
            name: 'Free', price: '$0', curr: true,
            feats: [
              '✓ Unlimited ranked queue',
              '✓ 3 active async duels',
              '✓ 1 lite coaching / day',
              '✗ ads after matches + every 2 lessons',
              '✗ async duels = ELO-only feedback',
            ],
          },
          {
            name: 'Plus', price: '$9.99/mo',
            feats: [
              '✓ Ad-free',
              '✓ 8 active duels',
              '✓ ~15 coaching jobs / month',
              '✓ lite ASR (whisper-small)',
              '✗ no full feedback on every match',
            ],
          },
          {
            name: 'Pro', price: '$15.99/mo', highlight: true,
            feats: [
              '✓ Unlimited full grading (Qwen3-ASR)',
              '✓ Priority GPU queue · <30s SLA',
              '✓ 5 manual phoneme requests / mo',
              '✓ Full DeepSeek referee on every match',
              '✓ Linguistic dashboard (lite)',
            ],
          },
          {
            name: 'Elite', price: '$19.99/mo',
            feats: [
              '✓ Whisper-large-v3-turbo on every match',
              '✓ Unlimited on-demand phoneme analysis',
              '✓ Highest-priority queue',
              '✓ Full analytics + custom remedial tracks',
              '✓ Elite-only rank borders',
            ],
          },
        ].map((t, i) => (
          <div key={i} className="wf-box" style={{
            padding: 12, borderRadius: 10,
            borderColor: t.highlight ? WF.accent : WF.ink,
            borderWidth: t.highlight ? 2 : 1.5,
            background: t.highlight ? '#fdeae3' : (t.curr ? WF.paper2 : WF.paper),
          }}>
            <div className="wf-row" style={{ justifyContent: 'space-between' }}>
              <div className="wf-row" style={{ gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</span>
                {t.curr && <span className="wf-pill wf-pill-fill" style={{ fontSize: 9 }}>CURRENT</span>}
                {t.highlight && <span className="wf-pill wf-pill-accent" style={{ fontSize: 9 }}>POPULAR</span>}
              </div>
              <span className="wf-mono" style={{ fontSize: 12 }}>{t.price}</span>
            </div>
            <div className="wf-col" style={{ gap: 2, marginTop: 6 }}>
              {t.feats.map((f, j) => (
                <span key={j} className="wf-anno" style={{ color: f.startsWith('✗') ? WF.accent : (f.startsWith('✓') ? WF.ink : WF.ink) }}>{f}</span>
              ))}
            </div>
            {!t.curr && <Btn primary={t.highlight} full style={{ marginTop: 8 }}>Upgrade to {t.name}</Btn>}
          </div>
        ))}
        <div className="wf-mono" style={{ fontSize: 9, color: WF.muted, textAlign: 'center', padding: 8 }}>
          billed via App Store / Play · cancel anytime · server-side caps via Celery `resolve_pipeline_tier`
        </div>
      </div>
    </Phone>
  );
}

// ─── Settings
function S_Settings() {
  const groups = [
    {
      title: 'Account',
      rows: [
        ['Email',          'alex@gmail.com', '›'],
        ['Username',       '@alex_es', '›'],
        ['Linked accounts','G  ', '›'],
        ['Password',       '',      '›'],
      ],
    },
    {
      title: 'Notifications',
      rows: [
        ['Async duel turn',     'on',  '◉'],
        ['Match result ready',  'on',  '◉'],
        ['Streak reminder',     'off', '○'],
        ['New season',          'on',  '◉'],
      ],
    },
    {
      title: 'Audio',
      rows: [
        ['Mic gain',         'auto', '›'],
        ['Push-to-talk',     'off',  '○'],
        ['Voice activity',   'sensitive', '›'],
        ['Output device',    'earbuds', '›'],
      ],
    },
    {
      title: 'Privacy & Safety',
      rows: [
        ['Block list',       '3', '›'],
        ['Report a player',  '',  '›'],
        ['Data & exports',   '',  '›'],
      ],
    },
    {
      title: 'Subscription',
      rows: [
        ['Plan',             'Free', '›'],
        ['Receipts',         '',     '›'],
      ],
    },
  ];
  return (
    <Phone label="31 · Settings">
      <NavBar left="< Profile" title="Settings" right="" />
      <div className="wf-col" style={{ padding: '6px 0', gap: 10, overflow: 'auto' }}>
        {groups.map((g, i) => (
          <div key={i} className="wf-col" style={{ gap: 1 }}>
            <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3, padding: '6px 14px' }}>{g.title.toUpperCase()}</div>
            {g.rows.map(([k, v, ind], j) => (
              <div key={j} className="wf-row" style={{ padding: '10px 14px', borderTop: `1px solid ${WF.ink}11`, borderBottom: `1px solid ${WF.ink}11`, background: WF.paper }}>
                <span style={{ fontSize: 12, flex: 1 }}>{k}</span>
                <span className="wf-mono" style={{ fontSize: 11, color: WF.muted, marginRight: 8 }}>{v}</span>
                <span className="wf-mono" style={{ fontSize: 12 }}>{ind}</span>
              </div>
            ))}
          </div>
        ))}
        <div className="wf-mono" style={{ fontSize: 10, padding: '8px 14px 16px', color: WF.accent, textAlign: 'center' }}>
          Log out · Delete account
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, { S_Profile, S_Leaderboard, S_Subscription, S_Settings });
