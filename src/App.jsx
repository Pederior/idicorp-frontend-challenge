import React, { useEffect, useState } from "react";
import { Activity, CheckCircle2, ChevronDown, CircleHelp, ClipboardList, Calculator as CalculatorIcon, LogOut, Menu, MessageSquare, ShieldCheck, X, Zap } from "lucide-react";
import Login from "./components/Login.jsx";
import Tasks from "./components/Tasks.jsx";
import Calculator from "./components/tools/Calculator.jsx";
import Echo from "./components/tools/Echo.jsx";
import StreamEcho from "./components/tools/StreamEcho.jsx";
import { ErrorBanner } from "./components/common.jsx";

const navItems = [
  { id: "tasks", label: "Task manager", icon: ClipboardList, tag: "01" },
  { id: "calculator", label: "Live calculator", icon: CalculatorIcon, tag: "02" },
  { id: "echo", label: "Text echo", icon: MessageSquare, tag: "03" },
  { id: "stream", label: "Stream echo", icon: Zap, tag: "04" },
];

function App() {
  const [session, setSession] = useState(() => {
    try { const saved = sessionStorage.getItem("idicorp-session"); return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [active, setActive] = useState("tasks");
  const [mobileNav, setMobileNav] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (session) sessionStorage.setItem("idicorp-session", JSON.stringify(session));
    else sessionStorage.removeItem("idicorp-session");
  }, [session]);

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(""), 2800); };
  if (!session) return <Login onLogin={setSession}/>;

  const current = navItems.find(n => n.id === active);
  function logout() { setSession(null); setActive("tasks"); setError(""); }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand"><span className="brand-mark"><Activity size={20}/></span><span>IDI<span className="brand-light">CORP</span><small>SERVICE CONSOLE</small></span><button className="icon-button mobile-close" onClick={()=>setMobileNav(false)} aria-label="Close navigation"><X size={18}/></button></div>
      <div className="workspace-chip"><div className="workspace-avatar">IC</div><div><b>Internal workspace</b><small>Production environment</small></div><ChevronDown size={15}/></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav aria-label="Main navigation">{navItems.map(item => <button key={item.id} className={`nav-item ${active===item.id?"nav-active":""}`} onClick={()=>{setActive(item.id);setMobileNav(false);setError("");}}><item.icon size={18}/><span>{item.label}</span><small>{item.tag}</small></button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><b>Need a hand?</b><p>Explore the tools and test service responses.</p><button onClick={()=>notify("Choose a tool from the workspace menu to get started.")}>Quick guide <span>↗</span></button></div><div className="profile-row"><div className="profile-avatar">{session.username?.slice(0,2).toUpperCase() || "AD"}</div><div className="profile-info"><b>{session.username}</b><small>Administrator</small></div><button className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={17}/></button></div></div>
    </aside>
    {mobileNav && <button className="nav-scrim" onClick={()=>setMobileNav(false)} aria-label="Close navigation overlay"/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-button menu-toggle" onClick={()=>setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><b>{current?.label}</b></div><div className="topbar-right"><span className="environment"><span className="live-dot"/> API connected</span><span className="topbar-divider"/><div className="top-user"><span className="profile-avatar small-avatar">{session.username?.slice(0,2).toUpperCase() || "AD"}</span><span>{session.username}</span></div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow"><span className="heading-mark"/> SERVICE WORKSPACE <span className="heading-sep">/</span> {current?.tag}</div><h1>{active==="tasks"?"Task manager":active==="calculator"?"Live calculator":active==="echo"?"Text echo":"Stream echo"}</h1><p>{active==="tasks"?"Organize your work, track progress, and keep things moving.":active==="calculator"?"Run calculations over a real-time WebSocket connection.":active==="echo"?"Send messages and inspect the live echo connection.":"Send content and inspect the response from the streaming endpoint."}</p></div><div className="heading-actions"><span className="secure-pill"><ShieldCheck size={14}/> Authenticated</span></div></div>
        <ErrorBanner message={error} onClose={()=>setError("")}/>
        {active==="tasks" && <Tasks token={session.token} onError={setError} notify={notify}/>}
        {active==="calculator" && <Calculator token={session.token} onError={setError} notify={notify}/>}
        {active==="echo" && <Echo token={session.token} onError={setError}/>}
        {active==="stream" && <StreamEcho token={session.token} onError={setError}/>}
        <footer className="page-footer"><span>© {new Date().getFullYear()} IDICorp · Service Console</span><span><span className="footer-dot"/> All systems operational</span></footer>
      </div>
    </main>
    {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}

export default App;
