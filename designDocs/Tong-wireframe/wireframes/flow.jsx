// flow.jsx — Master user flow diagram for Tong
// One large SVG showing every node + transitions between clusters
// (Auth/Onboarding · Home · Solo Grind · Async Duels · Live Ranked · Post-Match · Profile).

function MasterFlow() {
  const W = 1680;
  const H = 1080;
  const ink = WF.ink;
  const accent = WF.accent;
  const win = WF.accent2;
  const muted = WF.muted;

  // Node helper: anchor on right/left/center sides for arrows.
  const anchors = (x, y, w, h) => ({
    l: [x, y + h / 2], r: [x + w, y + h / 2],
    t: [x + w / 2, y], b: [x + w / 2, y + h],
    c: [x + w / 2, y + h / 2],
  });

  // ─── Auth & Onboarding cluster (top-left)
  const N_splash = { x: 60, y: 80, w: 130, h: 50 };
  const N_signup = { x: 230, y: 40, w: 130, h: 50 };
  const N_login  = { x: 230, y: 110, w: 130, h: 50 };
  const N_lang   = { x: 400, y: 80, w: 130, h: 50 };
  const N_plc    = { x: 570, y: 80, w: 130, h: 50 };
  const N_perm   = { x: 740, y: 80, w: 130, h: 50 };

  // ─── Home (center hub)
  const N_home = { x: 760, y: 230, w: 160, h: 70 };

  // ─── Solo Grind cluster (left-middle)
  const N_tier  = { x: 80, y: 360, w: 140, h: 50 };
  const N_less  = { x: 260, y: 340, w: 140, h: 50 };
  const N_card  = { x: 260, y: 410, w: 140, h: 50 };
  const N_sum   = { x: 440, y: 340, w: 140, h: 50 };
  const N_flash = { x: 80, y: 460, w: 140, h: 50 };
  const N_boss  = { x: 80, y: 540, w: 140, h: 50 };
  const N_bossR = { x: 260, y: 540, w: 140, h: 50 };

  // ─── Async Duels cluster (middle-bottom)
  const N_dlist = { x: 580, y: 460, w: 140, h: 50 };
  const N_ddet  = { x: 580, y: 540, w: 140, h: 50 };
  const N_drec  = { x: 580, y: 620, w: 140, h: 50 };
  const N_dres  = { x: 580, y: 700, w: 140, h: 50 };

  // ─── Live Ranked cluster (right)
  const N_queue = { x: 1000, y: 360, w: 150, h: 50 };
  const N_match = { x: 1000, y: 440, w: 150, h: 50 };
  const N_lobby = { x: 1000, y: 520, w: 150, h: 50 };
  const N_live  = { x: 1000, y: 600, w: 150, h: 50 };
  const N_concl = { x: 1000, y: 680, w: 150, h: 50 };
  const N_proc  = { x: 1000, y: 760, w: 150, h: 50 };
  const N_res   = { x: 1000, y: 840, w: 150, h: 50 };

  // ─── Post-Match / VOD (right-bottom)
  const N_vod   = { x: 1200, y: 760, w: 150, h: 50 };
  const N_vinj  = { x: 1200, y: 840, w: 150, h: 50 };

  // ─── Profile / Leaderboards / Subscription (top-right)
  const N_prof  = { x: 1230, y: 80, w: 140, h: 50 };
  const N_lead  = { x: 1230, y: 150, w: 140, h: 50 };
  const N_sub   = { x: 1410, y: 80, w: 140, h: 50 };
  const N_set   = { x: 1410, y: 150, w: 140, h: 50 };

  // ─── Edge / error states (bottom-right)
  const N_noMatch = { x: 1200, y: 360, w: 150, h: 50 };
  const N_disc    = { x: 1200, y: 600, w: 150, h: 50 };
  const N_cap     = { x: 820, y: 460, w: 130, h: 50 };

  const r = (n) => anchors(n.x, n.y, n.w, n.h);

  return (
    <div style={{
      width: W, padding: '32px 36px', background: WF.paper, color: WF.ink,
      fontFamily: WF.sans, position: 'relative',
    }}>
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <div className="wf-hand" style={{ fontSize: 52 }}>Tong — Master User Flow</div>
        <div className="wf-mono" style={{ fontSize: 12, color: WF.ink3 }}>
          Mobile · iOS / Android · MVP scope highlighted · arrows = primary navigation, dashed = system / push
        </div>
      </div>

      <svg width={W - 72} height={H} viewBox={`0 0 ${W - 72} ${H}`}>
        {/* Cluster outlines */}
        <ClusterLabel x={40} y={20} w={850} h={170} label="① Auth & Onboarding" color={ink} />
        <ClusterLabel x={1210} y={20} w={360} h={170} label="⑦ Profile & Account" color={ink} />
        <ClusterLabel x={720} y={210} w={240} h={110} label="② Home Hub" color={accent} />
        <ClusterLabel x={40} y={310} w={580} h={310} label="③ Solo Grind (PvE)" color={ink} />
        <ClusterLabel x={540} y={430} w={220} h={310} label="④ Async Audio Duels" color={ink} />
        <ClusterLabel x={960} y={310} w={240} h={600} label="⑤ Live Ranked (PvP)" color={accent} />
        <ClusterLabel x={1180} y={730} w={210} h={180} label="⑥ Post-Match VOD" color={ink} />

        {/* ── Auth nodes ── */}
        <FlowNode {...N_splash} title="Splash" kind="ENTRY" />
        <FlowNode {...N_signup} title="Sign-Up" kind="screen" />
        <FlowNode {...N_login}  title="Log-In"  kind="screen" />
        <FlowNode {...N_lang}   title="Pick Language" kind="screen" />
        <FlowNode {...N_plc}    title="Placement Quiz" kind="screen" />
        <FlowNode {...N_perm}   title="Mic / Notif Perms" kind="screen" />

        <Arrow from={r(N_splash).r} to={r(N_signup).l} />
        <Arrow from={r(N_splash).r} to={r(N_login).l}  curve={0} />
        <Arrow from={r(N_signup).r} to={r(N_lang).l} />
        <Arrow from={r(N_login).r}  to={r(N_lang).l}  curve={-10} />
        <Arrow from={r(N_lang).r}   to={r(N_plc).l} />
        <Arrow from={r(N_plc).r}    to={r(N_perm).l} />
        <Arrow from={r(N_perm).b}   to={r(N_home).t} curve={-40} label="enter app" />

        {/* ── Home ── */}
        <FlowNode {...N_home} title={['Home / Play Hub', '(Daily quest · CTA tiles)']} kind="screen" fill="#fdeae3" stroke={accent} textColor={ink} />

        {/* Home → main pillars */}
        <Arrow from={r(N_home).l} to={r(N_tier).t}  curve={-30} label="Solo" />
        <Arrow from={r(N_home).b} to={r(N_dlist).t} curve={0}   label="Duels" />
        <Arrow from={r(N_home).r} to={r(N_queue).t} curve={20}  label="Ranked" color={accent} />
        <Arrow from={r(N_home).t} to={r(N_prof).l}  curve={60}  label="Profile" />

        {/* ── Solo cluster ── */}
        <FlowNode {...N_tier}  title="Tier Map" kind="screen" />
        <FlowNode {...N_less}  title="Lesson Intro" kind="screen" />
        <FlowNode {...N_card}  title="Exercise Card" kind="screen" />
        <FlowNode {...N_sum}   title="Lesson Summary" kind="screen" />
        <FlowNode {...N_flash} title="Flashcard Deck" kind="screen" />
        <FlowNode {...N_boss}  title="Boss Battle Entry" kind="screen" />
        <FlowNode {...N_bossR} title="Boss Result / Promo" kind="screen" />

        <Arrow from={r(N_tier).r} to={r(N_less).l} />
        <Arrow from={r(N_less).b} to={r(N_card).t} />
        <Arrow from={r(N_card).r} to={r(N_sum).l} label="× N cards" />
        <Arrow from={r(N_card).b} to={r(N_card).b} />
        <Arrow from={r(N_sum).b}  to={r(N_flash).t} curve={-30} dashed label="wrong words → flashcards" color={muted} />
        <Arrow from={r(N_tier).b} to={r(N_flash).t} />
        <Arrow from={r(N_flash).b} to={r(N_boss).t} />
        <Arrow from={r(N_boss).r} to={r(N_bossR).l} />
        <Arrow from={r(N_bossR).t} to={r(N_tier).r} curve={-60} label="next tier unlock" color={win} />

        {/* ── Async duels ── */}
        <FlowNode {...N_dlist} title="Active Duels" kind="screen" />
        <FlowNode {...N_ddet}  title="Duel Detail" kind="screen" />
        <FlowNode {...N_drec}  title="Record Move" kind="screen" />
        <FlowNode {...N_dres}  title="Duel Result" kind="screen" />

        <Arrow from={r(N_dlist).b} to={r(N_ddet).t} />
        <Arrow from={r(N_ddet).b}  to={r(N_drec).t} label="your turn" />
        <Arrow from={r(N_drec).b}  to={r(N_ddet).b} curve={-90} dashed label="upload · advance turn · push" color={muted} />
        <Arrow from={r(N_ddet).r}  to={r(N_dres).r} curve={80} label="round 3/3" />

        {/* free tier cap warning */}
        <FlowNode {...N_cap} title={['Free tier cap', '(3 active duels)']} kind="ERROR" fill="#fff5d8" stroke={WF.warn} textColor={WF.warn} dashed />
        <Arrow from={r(N_dlist).l} to={r(N_cap).r} dashed label="4th queue → 403" color={WF.warn} />

        {/* ── Live ranked column ── */}
        <FlowNode {...N_queue} title="Queue Setup" kind="screen" fill="#fdeae3" stroke={accent} />
        <FlowNode {...N_match} title="Matchmaking" kind="screen" fill="#fdeae3" stroke={accent} />
        <FlowNode {...N_lobby} title="Match Lobby" kind="screen" fill="#fdeae3" stroke={accent} />
        <FlowNode {...N_live}  title="Live Battle (3min)" kind="screen" fill={accent} stroke={accent} textColor="#fff" />
        <FlowNode {...N_concl} title="Conclude" kind="system" />
        <FlowNode {...N_proc}  title="Processing…" kind="screen" />
        <FlowNode {...N_res}   title="Result Screen" kind="screen" fill="#e3f1e8" stroke={win} />

        <Arrow from={r(N_queue).b} to={r(N_match).t} />
        <Arrow from={r(N_match).b} to={r(N_lobby).t} label="match found · ±150 MMR" />
        <Arrow from={r(N_lobby).b} to={r(N_live).t}  label="both ready · Agora token" />
        <Arrow from={r(N_live).b}  to={r(N_concl).t} label="timer or both /conclude" />
        <Arrow from={r(N_concl).b} to={r(N_proc).t}  dashed label="Agora → R2 → Celery" color={muted} />
        <Arrow from={r(N_proc).b}  to={r(N_res).t}   label="≤ 60s grading" color={win} />
        <Arrow from={r(N_res).l}   to={r(N_home).b}  curve={-80} label="play again" />

        {/* Error / edge */}
        <FlowNode {...N_noMatch} title="No-match Notice" kind="ERROR" fill="#fff5d8" stroke={WF.warn} textColor={WF.warn} dashed />
        <Arrow from={r(N_match).r} to={r(N_noMatch).l} dashed label="5min timeout" color={WF.warn} />
        <Arrow from={r(N_noMatch).b} to={r(N_queue).r} curve={60} dashed label="retry" color={WF.warn} />

        <FlowNode {...N_disc} title={['Disconnect', 'Reconnect 30s']} kind="ERROR" fill="#fff5d8" stroke={WF.warn} textColor={WF.warn} dashed />
        <Arrow from={r(N_live).r} to={r(N_disc).l} dashed color={WF.warn} />
        <Arrow from={r(N_disc).b} to={r(N_concl).r} dashed label="forfeit / WIN by default" color={WF.warn} curve={40} />

        {/* ── Post-match VOD ── */}
        <FlowNode {...N_vod}  title="VOD Review" kind="screen" />
        <FlowNode {...N_vinj} title="Flashcard Injection" kind="system" dashed />
        <Arrow from={r(N_res).r} to={r(N_vod).l} label="see breakdown" />
        <Arrow from={r(N_vod).b} to={r(N_vinj).t} dashed color={muted} />
        <Arrow from={r(N_vinj).l} to={r(N_flash).r} curve={120} dashed label="flagged words → solo flashcards" color={muted} />

        {/* Async result feeds same pipeline */}
        <Arrow from={r(N_dres).r} to={r(N_vod).l} curve={-100} dashed label="async = same pipeline" color={muted} />

        {/* ── Profile cluster ── */}
        <FlowNode {...N_prof} title="Profile" kind="screen" />
        <FlowNode {...N_lead} title="Leaderboards" kind="screen" />
        <FlowNode {...N_sub}  title="Subscription" kind="screen" />
        <FlowNode {...N_set}  title="Settings" kind="screen" />

        <Arrow from={r(N_prof).b} to={r(N_lead).t} />
        <Arrow from={r(N_prof).r} to={r(N_sub).l} />
        <Arrow from={r(N_sub).b}  to={r(N_set).t} />

        {/* Subscription upgrade gates */}
        <Arrow from={r(N_cap).t} to={r(N_sub).b} curve={-300} dashed label="upgrade → Plus" color={WF.warn} />

        {/* Legend */}
        <g transform="translate(40, 950)">
          <text x="0" y="0" fontFamily={WF.hand} fontSize="22" fill={ink}>Legend</text>
          <line x1="0" y1="20" x2="40" y2="20" stroke={ink} strokeWidth="1.5" markerEnd="url(#leg-arr)" />
          <defs>
            <marker id="leg-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={ink} /></marker>
            <marker id="leg-arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={muted} /></marker>
          </defs>
          <text x="48" y="24" fontFamily={WF.mono} fontSize="11" fill={ink}>user nav</text>
          <line x1="130" y1="20" x2="170" y2="20" stroke={muted} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#leg-arr2)" />
          <text x="178" y="24" fontFamily={WF.mono} fontSize="11" fill={ink}>system / async</text>
          <rect x="280" y="10" width="30" height="20" rx="4" fill="#fdeae3" stroke={accent} strokeWidth="1.5" />
          <text x="318" y="24" fontFamily={WF.mono} fontSize="11" fill={ink}>live / ranked</text>
          <rect x="410" y="10" width="30" height="20" rx="4" fill="#e3f1e8" stroke={win} strokeWidth="1.5" />
          <text x="448" y="24" fontFamily={WF.mono} fontSize="11" fill={ink}>success / win</text>
          <rect x="540" y="10" width="30" height="20" rx="4" fill="#fff5d8" stroke={WF.warn} strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="578" y="24" fontFamily={WF.mono} fontSize="11" fill={ink}>edge / error state</text>
        </g>
      </svg>
    </div>
  );
}

Object.assign(window, { MasterFlow });
