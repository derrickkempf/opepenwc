import React, { createContext, useContext, useState, useRef, useEffect, Suspense, lazy } from 'react';

/* ─────────────────────────────────────────────────────────────
   Lazy auth. The heavy @privy-io/react-auth SDK is NOT in the main
   bundle — it lives in a separate chunk that only loads when a valid
   Privy App ID is configured. The whole app renders immediately as a
   guest and never waits on (or crashes without) Privy.
   ───────────────────────────────────────────────────────────── */

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || '';
const PRIVY_ENABLED = !!PRIVY_APP_ID;   // no App ID → pure guest mode, Privy never loads
const PRIVY_CONFIG = {
  loginMethods: ['email', 'google', 'apple', 'twitter', 'wallet'],
  embeddedWallets: { createOnLogin: 'users-without-wallets' },
  appearance: { theme: 'dark', accentColor: '#13a05a' },
};

const PrivyBridge = lazy(() => import('./privyBridge.jsx'));

/* Never let a Privy init failure blank the app — fall back to guest. */
class AuthBoundary extends React.Component {
  constructor(p) { super(p); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e) { try { console.warn('[auth] Privy unavailable — staying in guest mode:', e && e.message); } catch (_) {} }
  render() { return this.state.failed ? null : this.props.children; }
}

const Ctx = createContext(null);
export function useAuth() { return useContext(Ctx); }

export function AuthProvider({ children }) {
  const [pv, setPv] = useState({ ready: false, authenticated: false, user: null, login: null, logout: null });
  const [load, setLoad] = useState(false);
  const pending = useRef(false);

  const login = () => {
    if (!PRIVY_ENABLED) {
      try { alert('Sign-in isn\'t configured yet (no Privy App ID). You can browse and try the demo; voting opens once the site owner adds the Privy key.'); } catch (_) {}
      return;
    }
    if (pv.login) pv.login();
    else { pending.current = true; setLoad(true); }
  };
  const logout = () => { if (pv.logout) pv.logout(); };

  // Prefetch Privy on idle ONLY when configured.
  useEffect(() => {
    if (!PRIVY_ENABLED) return;
    const w = window;
    const start = () => setLoad(true);
    const handle = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 3000 }) : setTimeout(start, 1500);
    return () => { try { (w.cancelIdleCallback && w.requestIdleCallback) ? w.cancelIdleCallback(handle) : clearTimeout(handle); } catch (e) {} };
  }, []);

  const value = {
    ready: true,
    authenticated: pv.authenticated,
    user: pv.user,
    login,
    logout,
    authEnabled: PRIVY_ENABLED,
    authLoading: load && !pv.ready,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      {PRIVY_ENABLED && load && (
        <AuthBoundary>
          <Suspense fallback={null}>
            <PrivyBridge appId={PRIVY_APP_ID} config={PRIVY_CONFIG} onState={setPv} pending={pending} />
          </Suspense>
        </AuthBoundary>
      )}
    </Ctx.Provider>
  );
}
