import React, { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw, ShieldCheck } from "lucide-react";
import { request } from "../api.js";
import { ErrorBanner } from "./common.jsx";

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: "admin", password: "admin", captcha_answer: "" });
  const [challenge, setChallenge] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadCaptcha = useCallback(async () => {
    setError("");
    try {
      const data = await request("/api/auth/login");
      setChallenge(data);
      setCredentials(c => ({ ...c, captcha_answer: "" }));
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { loadCaptcha(); }, [loadCaptcha]);

  async function submit(e) {
    e.preventDefault();
    if (!challenge?.salt) { setError("CAPTCHA is not ready. Refresh it and try again."); return; }
    if (!credentials.username.trim() || !credentials.password || !credentials.captcha_answer.trim()) {
      setError("Enter your username, password, and CAPTCHA answer."); return;
    }
    setBusy(true); setError("");
    try {
      const result = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ ...credentials, salt: challenge.salt })
      });
      if (!result?.access_token) throw new Error("The service did not return an access token.");
      onLogin({ token: result.access_token, username: credentials.username });
    } catch (e) { setError(e.message); await loadCaptcha(); }
    finally { setBusy(false); }
  }

  return <main className="login-shell">
    <section className="login-visual">
      <div className="brand"><span className="brand-mark"><Activity size={20}/></span><span>IDI<span className="brand-light">CORP</span></span></div>
      <div className="visual-copy">
        <span className="eyebrow"><span className="live-dot"/> INTERNAL SERVICE PLATFORM</span>
        <h1>Everything your<br/>team needs, <em>in sync.</em></h1>
        <p>A single workspace to manage tasks and explore real-time service capabilities.</p>
      </div>
      <div className="visual-footer"><span>SECURE WORKSPACE</span><span>·</span><span>BUILT FOR TEAMS</span></div>
      <div className="orb orb-one"/><div className="orb orb-two"/><div className="grid-glow"/>
    </section>
    <section className="login-panel">
      <div className="login-card">
        <div className="mobile-brand"><span className="brand-mark"><Activity size={20}/></span><b>IDICORP</b></div>
        <div className="login-heading"><div className="icon-tile"><ShieldCheck size={22}/></div><span className="eyebrow">WELCOME BACK</span><h2>Sign in to console</h2><p>Enter your credentials to access your workspace.</p></div>
        <ErrorBanner message={error} onClose={() => setError("")}/>
        <form onSubmit={submit} className="form-stack">
          <label>Username<input autoComplete="username" value={credentials.username} onChange={e=>setCredentials(c=>({...c,username:e.target.value}))} placeholder="Your username" required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={credentials.password} onChange={e=>setCredentials(c=>({...c,password:e.target.value}))} placeholder="Your password" required /></label>
          <div className="captcha-label"><label htmlFor="captcha-answer">Security check</label><button type="button" className="text-button" onClick={loadCaptcha}><RefreshCw size={13}/> New code</button></div>
          <div className="captcha-row">
            <div className="captcha-image">{challenge?.captcha ? <img src={challenge.captcha} alt="CAPTCHA challenge"/> : <span>Loading challenge…</span>}</div>
            <input id="captcha-answer" autoComplete="off" value={credentials.captcha_answer} onChange={e=>setCredentials(c=>({...c,captcha_answer:e.target.value}))} placeholder="Enter code" required/>
          </div>
          <button className="primary-button full-button" disabled={busy || !challenge} type="submit">{busy ? <><span className="spinner"/> Signing in…</> : <>Sign in <span>→</span></>}</button>
        </form>
        <div className="login-security"><ShieldCheck size={15}/><span>Your session is protected with secure authentication.</span></div>
        <div className="login-bottom"><span>© {new Date().getFullYear()} IDICorp</span><span>Service Console <span className="version">v1.0</span></span></div>
      </div>
    </section>
  </main>;
}

export default Login;
