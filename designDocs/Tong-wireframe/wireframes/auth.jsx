// auth.jsx — Tong auth & onboarding wireframes

// ─── Splash / landing
function S_Splash() {
  return (
    <Phone label="01 · Splash">
      <div className="wf-col" style={{ height: '100%', justifyContent: 'space-between', padding: 24 }}>
        <div />
        <div className="wf-col" style={{ alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 84, height: 84, borderRadius: 24, border: `2px solid ${WF.ink}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: WF.hand, fontSize: 60, fontWeight: 700, background: WF.paper2,
          }}>T</div>
          <div className="wf-hand" style={{ fontSize: 44, lineHeight: 1 }}>Tong</div>
          <div className="wf-mono" style={{ fontSize: 11, color: WF.ink3, textAlign: 'center', maxWidth: 220 }}>
            Speak before you're ready. Climb the ranked ladder of language.
          </div>
        </div>
        <div className="wf-col" style={{ gap: 10, paddingBottom: 8 }}>
          <Btn primary full>Get started</Btn>
          <Btn full>I have an account</Btn>
          <div className="wf-mono" style={{ fontSize: 10, color: WF.muted, textAlign: 'center', marginTop: 6 }}>
            ENG  ·  ESP  ·  JPN  ·  KOR  ·  +9 more
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ─── Sign-up A: email + OAuth
function S_SignupA() {
  return (
    <Phone label="02a · Sign-Up" sub="email + OAuth">
      <NavBar left="< Back" title="Create account" right="" />
      <div className="wf-col" style={{ padding: 20, gap: 14 }}>
        <div className="wf-row" style={{ gap: 10 }}>
          <Btn full><span className="wf-mono">G  Google</span></Btn>
          <Btn full><span className="wf-mono"></span></Btn>
        </div>
        <div className="wf-row" style={{ gap: 8, alignItems: 'center' }}>
          <div className="wf-divider" style={{ flex: 1 }} />
          <span className="wf-mono" style={{ fontSize: 10 }}>or email</span>
          <div className="wf-divider" style={{ flex: 1 }} />
        </div>
        <div className="wf-col" style={{ gap: 10 }}>
          <Placeholder h={36}>username</Placeholder>
          <Placeholder h={36}>email@domain.com</Placeholder>
          <Placeholder h={36}>password</Placeholder>
        </div>
        <Btn primary full size="l">Continue</Btn>
        <div className="wf-mono" style={{ fontSize: 9, color: WF.muted, textAlign: 'center', lineHeight: 1.5 }}>
          POST /auth/signup → returns JWT<br />
          ToS · Privacy · Already a member?
        </div>
      </div>
    </Phone>
  );
}

// ─── Sign-up B: OAuth-only (alt approach)
function S_SignupB() {
  return (
    <Phone label="02b · Sign-Up" sub="OAuth-only alt">
      <div className="wf-col" style={{ padding: 24, gap: 18, height: '100%' }}>
        <div className="wf-hand" style={{ fontSize: 28 }}>Join the arena</div>
        <div className="wf-anno">No long forms. Pick a provider; we'll build the profile after placement.</div>
        <div className="wf-col" style={{ gap: 12, marginTop: 12 }}>
          <Btn full size="l">G  Continue with Google</Btn>
          <Btn full size="l">  Continue with Apple</Btn>
          <Btn full size="l">@  Continue with Discord</Btn>
        </div>
        <div className="wf-divider" />
        <Btn full>Use email instead</Btn>
        <div style={{ flex: 1 }} />
        <Placeholder h={42}>by continuing, you agree to ToS + Privacy</Placeholder>
      </div>
    </Phone>
  );
}

// ─── Login
function S_Login() {
  return (
    <Phone label="03 · Log-In">
      <NavBar left="< Back" title="Welcome back" right="" />
      <div className="wf-col" style={{ padding: 20, gap: 14 }}>
        <Placeholder h={36}>email or @username</Placeholder>
        <Placeholder h={36}>password</Placeholder>
        <div style={{ alignSelf: 'flex-end', fontFamily: WF.mono, fontSize: 10, textDecoration: 'underline' }}>forgot?</div>
        <Btn primary full size="l">Log in</Btn>
        <div className="wf-row" style={{ gap: 8 }}>
          <Btn full>G</Btn>
          <Btn full></Btn>
          <Btn full>@</Btn>
        </div>
        <div className="wf-mono" style={{ fontSize: 9, color: WF.muted, textAlign: 'center' }}>
          POST /auth/login → JWT (24h) + refresh token<br />
          rate-limited · 5 attempts / 10 min / IP
        </div>
      </div>
    </Phone>
  );
}

// ─── Language pick
function S_LangPick() {
  const langs = [
    ['🇪🇸', 'Spanish', '850k learners'],
    ['🇯🇵', 'Japanese', '420k'],
    ['🇰🇷', 'Korean', '310k'],
    ['🇫🇷', 'French', '280k'],
    ['🇩🇪', 'German', '210k'],
    ['🇨🇳', 'Mandarin', '180k'],
    ['🇮🇹', 'Italian', '95k'],
    ['🇵🇹', 'Portuguese', '88k'],
  ];
  return (
    <Phone label="04 · Pick Language">
      <NavBar left="< Back" title="What are you learning?" right="1/3" />
      <div className="wf-col" style={{ padding: 16, gap: 8 }}>
        <Placeholder h={32}>search 12+ languages</Placeholder>
        <div className="wf-col" style={{ gap: 6, marginTop: 4 }}>
          {langs.map(([f, n, c], i) => (
            <div key={i} className="wf-row" style={{
              padding: '8px 12px', border: `1.5px solid ${WF.ink}`, borderRadius: 8,
              background: i === 0 ? WF.ink : 'transparent', color: i === 0 ? '#fff' : WF.ink,
            }}>
              <span style={{ fontSize: 20 }}>{f}</span>
              <div className="wf-col" style={{ gap: 2, flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{n}</span>
                <span className="wf-mono" style={{ fontSize: 9, opacity: 0.7 }}>{c}</span>
              </div>
              {i === 0 && <span style={{ fontSize: 12 }}>✓</span>}
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

// ─── Placement quiz A: short adaptive
function S_PlacementA() {
  return (
    <Phone label="05a · Placement Quiz" sub="adaptive · 6 Qs">
      <NavBar left="" title="Quick placement" right="2 / 6" />
      <div style={{ height: 4, background: WF.ink, opacity: 0.15, margin: '0 16px' }}>
        <div style={{ width: '33%', height: 4, background: WF.accent }} />
      </div>
      <div className="wf-col" style={{ padding: 20, gap: 14 }}>
        <div className="wf-mono" style={{ fontSize: 10, color: WF.ink3 }}>TRANSLATE</div>
        <div className="wf-hand" style={{ fontSize: 28, lineHeight: 1.1 }}>
          "I'd like the bill, please."
        </div>
        <div className="wf-col" style={{ gap: 8, marginTop: 10 }}>
          {['La cuenta, por favor.', 'Quiero pagar ahora mismo.', 'Me trae la cuenta?', 'No sé lo que quiero.'].map((t, i) => (
            <div key={i} style={{
              padding: '10px 12px', border: `1.5px solid ${WF.ink}`, borderRadius: 8,
              fontFamily: WF.sans, fontSize: 13,
              background: i === 0 ? WF.paper2 : WF.paper,
            }}>{String.fromCharCode(65 + i)}.  {t}</div>
          ))}
        </div>
        <Btn full disabled style={{ marginTop: 6 }}>Pick one</Btn>
      </div>
    </Phone>
  );
}

// ─── Placement quiz B: self-rate (alt)
function S_PlacementB() {
  return (
    <Phone label="05b · Placement Quiz" sub="self-rate alt">
      <NavBar left="< Back" title="Where are you at?" right="" />
      <div className="wf-col" style={{ padding: 20, gap: 12 }}>
        <div className="wf-anno" style={{ background: WF.paper2, padding: 10, borderRadius: 6 }}>
          Pick the bucket that feels closest. You can retake a Boss Battle anytime to climb tiers.
        </div>
        {[
          ['BRONZE', 'A1', 'Brand new. Hello, gracias, números.'],
          ['SILVER', 'A2', 'Survive a café. Past tense is shaky.'],
          ['GOLD',   'B1', 'Hold a 5-min chat without panic.'],
          ['PLAT',   'B2', 'Watch shows. Argue about politics.'],
          ['DIAM',   'C1', 'Idioms, slang, professional contexts.'],
        ].map(([t, c, d], i) => (
          <div key={i} className="wf-row" style={{
            padding: '10px 12px', border: `1.5px solid ${WF.ink}`, borderRadius: 10,
            background: i === 1 ? WF.paper2 : 'transparent', gap: 12,
          }}>
            <RankBadge tier={t} size={40} />
            <div className="wf-col" style={{ flex: 1, gap: 2 }}>
              <div className="wf-row" style={{ gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{t}</span>
                <span className="wf-chip">{c}</span>
              </div>
              <span className="wf-anno">{d}</span>
            </div>
            <span style={{ fontFamily: WF.mono, fontSize: 11 }}>{i === 1 ? '●' : '○'}</span>
          </div>
        ))}
      </div>
    </Phone>
  );
}

// ─── Permission asks
function S_Perms() {
  return (
    <Phone label="06 · Permissions">
      <NavBar left="" title="Two quick asks" right="3 / 3" />
      <div className="wf-col" style={{ padding: 20, gap: 14 }}>
        <div className="wf-box" style={{ padding: 14, borderRadius: 10, display: 'flex', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, border: `1.5px solid ${WF.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎤</div>
          <div className="wf-col" style={{ gap: 4, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Microphone</div>
            <div className="wf-anno">Required. Live battles + duels won't work without it.</div>
            <Btn primary size="s" style={{ alignSelf: 'flex-start', marginTop: 4 }}>Allow</Btn>
          </div>
        </div>
        <div className="wf-box" style={{ padding: 14, borderRadius: 10, display: 'flex', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, border: `1.5px solid ${WF.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔔</div>
          <div className="wf-col" style={{ gap: 4, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Push notifications</div>
            <div className="wf-anno">Strongly recommended — async duels rely on push to alert your turn (12h window).</div>
            <Btn size="s" style={{ alignSelf: 'flex-start', marginTop: 4 }}>Allow · Skip</Btn>
          </div>
        </div>
        <div className="wf-anno" style={{ color: WF.warn, padding: '8px 0' }}>
          ⚠ Deny mic → app cannot proceed past this screen. Show a "you'll need this" sheet w/ Settings deep-link.
        </div>
        <Btn primary full size="l">Enter Tong →</Btn>
      </div>
    </Phone>
  );
}

Object.assign(window, { S_Splash, S_SignupA, S_SignupB, S_Login, S_LangPick, S_PlacementA, S_PlacementB, S_Perms });
