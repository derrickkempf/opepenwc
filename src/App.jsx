import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth.jsx';
import { deriveIdentity } from './lib/identity.js';
import GridFX from './components/GridFX.jsx';
import { hydrate, subscribeRealtime, SHARED } from './lib/storage.js';
import { nFmt, tp, myName } from './lib/game.js';
import {
  ViewHome, ViewPlay, ViewTeams, ViewKits, ViewBracket, ViewStandings, ViewEarn,
  ViewBanter, ViewProfile, ViewRules, ViewAbout, ViewSponsor,
  ViewTerms, ViewPrivacy, ViewAdmin, ModalRoot, Toast, Flash,
} from './views.jsx';

function useHash() {
  const [hash, setHash] = useState(location.hash || '#/');
  useEffect(() => {
    const on = () => setHash(location.hash || '#/');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

/* Top tab nav = Play / Teams / Kits / Bracket (prototype). Everything else lives
   in the hamburger drawer. */
const TOP_NAV = [
  ['#/play', 'Play'], ['#/teams', 'Teams'], ['#/kits', 'Kits'], ['#/bracket', 'Bracket'],
];
/* ===== right-side drawer menu (secondary destinations) ===== */
const MENU_LINKS = [
  ['#/standings', 'Standings'], ['#/earn', 'Earn'], ['#/banter', 'Critique'],
  ['#/rules', 'Rules'], ['#/about', 'About'], ['#/sponsor', 'Sponsor'], ['#/admin', 'Admin'],
];

function TopNav({ route }) {
  const active = (h) => route.startsWith(h) || (h === '#/play' && (route === '#/' || route.startsWith('#/login')));
  return (
    <nav className="nav wrap">
      {TOP_NAV.map(([h, t]) => (
        <a key={h} href={h} className={active(h) ? 'on' : ''}>{t}</a>
      ))}
    </nav>
  );
}
function MenuDrawer({ open, onClose, ctx }) {
  if (!open) return null;
  const name = ctx.id ? myName(ctx.id, ctx.identity?.short) : null;
  return (
    <div className="menu-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="menu-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="menu-close" aria-label="Close menu" onClick={onClose}>✕</button>
        <div className="menu-links">
          {MENU_LINKS.map(([h, t]) => (
            <a key={h} href={h} onClick={onClose}>{t}</a>
          ))}
          {ctx.id ? (
            <a href="#/profile" onClick={onClose}>{name ? name : 'Profile'}</a>
          ) : (
            <a href="#/login" onClick={(e) => { e.preventDefault(); onClose(); ctx.login(); }}>Check in</a>
          )}
        </div>
        <div className="menu-foot">
          <span>© DEWD</span>
          <a href="#/terms" onClick={onClose}>Terms</a>
          <a href="#/privacy" onClick={onClose}>Privacy</a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { ready, authenticated, user, login, logout } = useAuth();
  const route = useHash();
  const [, force] = useState(0);
  const rerender = useCallback(() => force((n) => n + 1), []);
  const [menuOpen, setMenuOpen] = useState(false);

  const identity = authenticated && user ? deriveIdentity(user) : null;
  const id = identity?.id || null;

  // Close the drawer on navigation.
  useEffect(() => { setMenuOpen(false); }, [route]);

  // Hydrate + realtime once.
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (SHARED) { try { await hydrate(); subscribeRealtime(() => { if (mounted) rerender(); }); } catch (e) { console.warn(e); } }
      if (mounted) rerender();
    })();
    console.info('[OWC] data mode:', SHARED ? 'shared (Supabase)' : 'local-only');
    return () => { mounted = false; };
  }, [rerender]);

  if (!ready) {
    return <main><p className="page-sub" style={{ marginTop: 80 }}>Loading…</p></main>;
  }

  const ctx = { id, identity, login, logout, authenticated, rerender };

  const r = route || '#/';
  const isPlay = r.startsWith('#/play') || r.startsWith('#/login') || r.startsWith('#/critique');
  const isHome = (r === '#/' || r === '');

  let view;
  if (r === '#/' || r === '') view = <ViewHome ctx={ctx} />;
  else if (r.startsWith('#/play')) view = <ViewPlay ctx={ctx} />;
  else if (r.startsWith('#/login')) view = <ViewPlay ctx={ctx} loginOnMount />;
  else if (r.startsWith('#/teams')) view = <ViewTeams ctx={ctx} />;
  else if (r.startsWith('#/kits')) view = <ViewKits />;
  else if (r.startsWith('#/bracket')) view = <ViewBracket ctx={ctx} />;
  else if (r.startsWith('#/standings')) view = <ViewStandings ctx={ctx} />;
  else if (r.startsWith('#/earn')) view = <ViewEarn ctx={ctx} />;
  else if (r.startsWith('#/banter') || r.startsWith('#/critique')) view = <ViewBanter ctx={ctx} />;
  else if (r.startsWith('#/profile')) view = <ViewProfile ctx={ctx} />;
  else if (r.startsWith('#/rules')) view = <ViewRules />;
  else if (r.startsWith('#/about')) view = <ViewAbout />;
  else if (r.startsWith('#/sponsor')) view = <ViewSponsor />;
  else if (r.startsWith('#/terms')) view = <ViewTerms />;
  else if (r.startsWith('#/privacy')) view = <ViewPrivacy />;
  else if (r.startsWith('#/admin')) view = <ViewAdmin ctx={ctx} />;
  else view = <ViewPlay ctx={ctx} />;

  return (
    <div className={isPlay ? 'route-play' : (isHome ? 'route-home' : '')}>
      <GridFX />
      <header>
        <div className="eyebrow">2026</div>
        <a href="#/" style={{ textDecoration: 'none' }}><h1>Opepen Art World Cup</h1></a>
        <p className="sub">A 40-team single-elimination tournament decided on instinct. Trust your gut, or risk missing completely.</p>
        <button className="hamburger" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <span></span><span></span><span></span>
        </button>
      </header>
      <TopNav route={r} />
      <main id="app" key={r + ':' + (id || '')}>{view}</main>
      <footer>
        <a href="#/about">A DEWD idea</a><a href="#/rules">Rules</a><a href="#/terms">Terms</a><a href="#/privacy">Privacy</a><a href="#/admin">Admin</a>
      </footer>
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} ctx={ctx} />
      <ModalRoot />
      <Toast />
      <Flash />
    </div>
  );
}
