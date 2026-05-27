// wf.jsx — wireframe primitives for Tong
// Mid-fi sketchy mobile wireframes. Hand-written headings, mono annotations,
// black & white with one warm accent for "Ranked / Live" energy.

const WF = {
  ink: '#181612',
  ink2: '#3a342c',
  paper: '#fbf8f1',
  paper2: '#f3eddf',
  rule: '#181612',
  dashed: '#5a534a',
  muted: '#8a8275',
  accent: '#c4452f',     // ranked / live / boss
  accent2: '#1f6e3a',    // confirm / win / ELO+
  warn: '#b88500',       // gating / cap reached
  ink3: '#666056',
  shadow: '0 1px 0 #1814, 0 2px 8px rgba(20,18,15,0.06)',
  hand: '"Caveat", "Patrick Hand", "Architects Daughter", cursive',
  mono: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
  sans: '"Inter", system-ui, -apple-system, sans-serif',
};

// Inject fonts + base utility classes once.
if (typeof document !== 'undefined' && !document.getElementById('wf-styles')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Patrick+Hand&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'wf-styles';
  s.textContent = `
    .wf-hand { font-family: ${WF.hand}; line-height: 1.05; color: ${WF.ink}; }
    .wf-mono { font-family: ${WF.mono}; color: ${WF.ink2}; letter-spacing: 0.01em; }
    .wf-sans { font-family: ${WF.sans}; color: ${WF.ink}; }
    .wf-dashed { border: 1.5px dashed ${WF.dashed}; }
    .wf-box   { border: 1.5px solid ${WF.ink}; background: ${WF.paper}; }
    .wf-fill  { background: ${WF.ink}; color: ${WF.paper}; }
    .wf-strike { text-decoration: line-through; opacity: 0.5; }
    .wf-tick::before { content: '✓ '; color: ${WF.accent2}; }
    .wf-cross::before { content: '✗ '; color: ${WF.accent}; }
    .wf-arrow { color: ${WF.ink}; }
    .wf-anno { font-family: ${WF.mono}; font-size: 10px; color: ${WF.ink3}; line-height: 1.45; }
    .wf-num  { display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:${WF.ink};color:${WF.paper};font:600 11px/1 ${WF.sans};margin-right:6px;flex:0 0 auto;}
    .wf-pill { display:inline-flex;align-items:center;border:1.5px solid ${WF.ink};border-radius:999px;padding:3px 9px;font:500 11px/1 ${WF.sans};background:${WF.paper};}
    .wf-pill-fill { background:${WF.ink};color:${WF.paper};border-color:${WF.ink};}
    .wf-pill-accent { background:${WF.accent};color:#fff;border-color:${WF.accent};}
    .wf-pill-win { background:${WF.accent2};color:#fff;border-color:${WF.accent2};}
    .wf-chip { display:inline-block;border:1px solid ${WF.ink};border-radius:4px;padding:2px 6px;font:500 10px/1.2 ${WF.mono};margin-right:4px;background:${WF.paper};}
    .wf-tap { box-shadow: 0 2px 0 ${WF.ink}; }
    .wf-row { display:flex;align-items:center;gap:8px; }
    .wf-col { display:flex;flex-direction:column; }
    .wf-divider { height:1px;background:${WF.ink};opacity:0.15; }
    .wf-bg-1 { background:${WF.paper}; }
    .wf-bg-2 { background:${WF.paper2}; }
    .wf-screen-title { font-family:${WF.hand}; font-size:26px; color:${WF.ink}; line-height:1; }
    .wf-screen-sub   { font-family:${WF.mono}; font-size:11px; color:${WF.ink3}; }

    /* Sketchy "scribble" underline */
    .wf-uline { position:relative; display:inline-block; }
    .wf-uline::after { content:''; position:absolute; left:-2px; right:-4px; bottom:-3px; height:5px;
      background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 6' preserveAspectRatio='none'><path d='M0 3 Q 8 1 16 3 T 32 3 T 48 3 T 64 3 T 80 3 T 100 3' stroke='%23c4452f' stroke-width='1.6' fill='none'/></svg>") no-repeat center/100% 100%; }
  `;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────
// Phone — minimalist wireframe phone shell (no status bar chrome).
// width default 320 × height default 640. Children fill the screen.
// ─────────────────────────────────────────────────────────────
function Phone({ width = 320, height = 640, label, sub, children, dark = false, hideChrome = false, accentBar = false }) {
  const bg = dark ? WF.ink : WF.paper;
  const fg = dark ? WF.paper : WF.ink;
  return (
    <div style={{ width, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingLeft: 2 }}>
          <div className="wf-screen-title">{label}</div>
          {sub && <div className="wf-screen-sub">{sub}</div>}
        </div>
      )}
      <div style={{
        width, height, background: bg, color: fg,
        border: `2px solid ${WF.ink}`, borderRadius: 28,
        position: 'relative', overflow: 'hidden',
        boxShadow: WF.shadow,
      }}>
        {!hideChrome && (
          <>
            {/* Status bar */}
            <div style={{
              height: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 18px 0', fontFamily: WF.mono, fontSize: 10, color: fg, opacity: 0.8,
            }}>
              <span>9:41</span>
              <span style={{ width: 60, height: 14, background: dark ? '#000' : '#000', borderRadius: 8, opacity: dark ? 0.5 : 0.85 }} />
              <span>·•·</span>
            </div>
            {accentBar && <div style={{ height: 3, background: WF.accent }} />}
          </>
        )}
        <div style={{ position: 'absolute', top: hideChrome ? 0 : (accentBar ? 31 : 28), left: 0, right: 0, bottom: 18 }}>
          {children}
        </div>
        {/* Home indicator */}
        <div style={{
          position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
          width: 92, height: 4, borderRadius: 2, background: fg, opacity: 0.7,
        }} />
      </div>
    </div>
  );
}

// Top navbar inside the phone (e.g. "< Back   Title   ⋯")
function NavBar({ left, title, right, accent = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px 8px', borderBottom: `1px solid ${WF.ink}22`,
      background: accent ? WF.accent : 'transparent', color: accent ? '#fff' : WF.ink,
    }}>
      <span className="wf-mono" style={{ fontSize: 11, minWidth: 40 }}>{left || ''}</span>
      <span className="wf-sans" style={{ fontWeight: 600, fontSize: 13 }}>{title}</span>
      <span className="wf-mono" style={{ fontSize: 11, minWidth: 40, textAlign: 'right' }}>{right || ''}</span>
    </div>
  );
}

// Bottom tab bar
function TabBar({ active = 'home', dark = false }) {
  const tabs = [
    ['home', 'Home'],
    ['solo', 'Grind'],
    ['duels', 'Duels'],
    ['rank', 'Rank'],
    ['me', 'Me'],
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 22, left: 0, right: 0,
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 6px 6px', borderTop: `1px solid ${dark ? '#fff3' : WF.ink + '22'}`,
      background: dark ? WF.ink : WF.paper,
    }}>
      {tabs.map(([id, label]) => (
        <div key={id} className="wf-col" style={{ alignItems: 'center', gap: 3, opacity: active === id ? 1 : 0.45 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${dark ? '#fff' : WF.ink}`, background: active === id ? (dark ? '#fff' : WF.ink) : 'transparent' }} />
          <div className="wf-mono" style={{ fontSize: 9, color: dark ? '#fff' : WF.ink }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// Dashed placeholder box with optional label
function Placeholder({ children, h = 60, style = {} }) {
  return (
    <div className="wf-dashed wf-mono" style={{
      borderRadius: 6, padding: 8, minHeight: h, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: WF.muted, fontSize: 10, textAlign: 'center', ...style,
    }}>{children}</div>
  );
}

// Solid wireframe button
function Btn({ children, primary = false, danger = false, disabled = false, size = 'm', full = false, style = {} }) {
  const h = size === 's' ? 28 : size === 'l' ? 48 : 36;
  const bg = disabled ? '#ddd6c5' : danger ? WF.accent : primary ? WF.ink : 'transparent';
  const fg = disabled ? WF.muted : (primary || danger) ? '#fff' : WF.ink;
  const bd = disabled ? '#ccc' : danger ? WF.accent : WF.ink;
  return (
    <div style={{
      height: h, lineHeight: `${h - 4}px`, padding: '0 14px',
      background: bg, color: fg, border: `1.5px solid ${bd}`, borderRadius: 8,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: WF.sans, fontWeight: 600, fontSize: 13,
      width: full ? '100%' : 'auto', boxSizing: 'border-box',
      ...style,
    }}>{children}</div>
  );
}

// Annotation note (sketchy callout pointing at a screen)
function Note({ children, w = 220, color }) {
  return (
    <div className="wf-anno" style={{
      width: w, padding: '8px 10px',
      background: '#fef4a8', border: `1px solid ${color || '#b39200'}`, borderRadius: 4,
      color: '#3a2f10', boxShadow: '1px 1px 0 rgba(0,0,0,0.06)',
      transform: 'rotate(-0.4deg)',
    }}>{children}</div>
  );
}

// Annotation block (engineer-style numbered callouts).
function Callouts({ items, w = 240 }) {
  return (
    <div className="wf-col" style={{ width: w, gap: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span className="wf-num">{i + 1}</span>
          <div className="wf-anno" style={{ flex: 1 }}>{it}</div>
        </div>
      ))}
    </div>
  );
}

// Sketchy arrow connecting two anchors in a flow diagram (svg).
function Arrow({ from, to, curve = 0, label, color = WF.ink, dashed = false }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2 + curve;
  const my = (y1 + y2) / 2 - Math.abs(curve) * 0.3;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  const id = `arr-${x1}-${y1}-${x2}-${y2}`.replace(/\./g, '_');
  return (
    <g>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray={dashed ? '4 4' : 'none'} markerEnd={`url(#${id})`} />
      {label && (
        <text x={mx} y={my - 4} fontFamily={WF.mono} fontSize="10" fill={color} textAnchor="middle">{label}</text>
      )}
    </g>
  );
}

// Flow-diagram node — rounded rect with label and optional kind tag.
function FlowNode({ x, y, w = 140, h = 56, title, kind, fill = WF.paper, stroke = WF.ink, textColor = WF.ink, dashed = false }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width={w} height={h} rx={10} fill={fill} stroke={stroke} strokeWidth="1.5" strokeDasharray={dashed ? '4 4' : 'none'} />
      {kind && (
        <text x={10} y={16} fontFamily={WF.mono} fontSize="9" fill={textColor} opacity="0.6">{kind}</text>
      )}
      <text x={w / 2} y={h / 2 + (kind ? 8 : 4)} fontFamily={WF.sans} fontWeight="600" fontSize="12" fill={textColor} textAnchor="middle">
        {Array.isArray(title) ? title.map((t, i) => <tspan key={i} x={w / 2} dy={i === 0 ? 0 : 14}>{t}</tspan>) : title}
      </text>
    </g>
  );
}

// Cluster group label
function ClusterLabel({ x, y, label, w, h, color = WF.ink }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="6 4" rx="14" opacity="0.5" />
      <text x={x + 12} y={y - 6} fontFamily={WF.hand} fontSize="20" fill={color}>{label}</text>
    </g>
  );
}

// Mic/voice viz placeholder
function VoiceWave({ w = 140, h = 36, n = 32, active = true, color = WF.ink }) {
  const bars = Array.from({ length: n }, (_, i) => {
    const phase = (i / n) * Math.PI * 4;
    const a = active ? (Math.sin(phase) * 0.4 + Math.cos(i * 0.7) * 0.3 + 0.5) : 0.15;
    return Math.max(2, Math.min(1, Math.abs(a)) * h);
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {bars.map((bh, i) => (
        <rect key={i} x={(w / n) * i + 1} y={(h - bh) / 2} width={(w / n) - 2} height={bh} rx={1} fill={color} opacity={active ? 0.85 : 0.3} />
      ))}
    </svg>
  );
}

// Rank badge (sketchy hex/shield)
function RankBadge({ tier = 'BRONZE', size = 56 }) {
  const colors = {
    BRONZE: ['#a06940', '#5a3a22'],
    SILVER: ['#b9bcc2', '#5a5e66'],
    GOLD:   ['#d9b34a', '#7a5a14'],
    PLAT:   ['#79cab0', '#1c5a48'],
    DIAM:   ['#7ab8d9', '#1a4a64'],
    MASTER: ['#b378d9', '#3e1c5a'],
  };
  const [bg, fg] = colors[tier] || colors.BRONZE;
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <polygon points="28,4 50,16 50,40 28,52 6,40 6,16" fill={bg} stroke={fg} strokeWidth="2" />
      <polygon points="28,12 44,20 44,36 28,44 12,36 12,20" fill="none" stroke={fg} strokeWidth="1" opacity="0.5" />
      <text x="28" y="33" textAnchor="middle" fontFamily={WF.sans} fontWeight="700" fontSize="11" fill={fg}>{tier.slice(0, 3)}</text>
    </svg>
  );
}

Object.assign(window, { WF, Phone, NavBar, TabBar, Placeholder, Btn, Note, Callouts, Arrow, FlowNode, ClusterLabel, VoiceWave, RankBadge });
