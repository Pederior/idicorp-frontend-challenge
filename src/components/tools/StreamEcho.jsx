import React, { useState } from "react";
import { Activity, CheckCircle2, ClipboardList, Send, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { apiBase } from "../../api.js";
import { ToolIntro } from "../common.jsx";

function StreamEcho({token,onError}) {
  const [content,setContent]=useState("Hello from IDICorp console.");
  const [contentType,setContentType]=useState("text/plain");
  const [status,setStatus]=useState("disconnected");
  const [response,setResponse]=useState("");
  const [responseType,setResponseType]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function send(e) {
    e.preventDefault();setError("");setResponse("");setBusy(true);setStatus("connecting");onError("");
    try {
      const res=await fetch(`${apiBase}/api/echo/stream`,{method:"POST",headers:{"Authorization":`Bearer ${token}`,"Content-Type":contentType},credentials:"include",body:content});
      if(!res.ok){let message=`Request failed (${res.status})`;try{const data=await res.json();message=data.detail||data.message||message;}catch{}throw new Error(message);}
      setResponseType(res.headers.get("content-type")||"unknown");
      if(res.body){const reader=res.body.getReader();const decoder=new TextDecoder();let output="";while(true){const {done,value}=await reader.read();if(done)break;output+=decoder.decode(value,{stream:true});setResponse(output);}output+=decoder.decode();setResponse(output);}
      else setResponse(await res.text());
      setStatus("connected");
    } catch(e){setError(e.message);onError(e.message);setStatus("error");}
    finally{setBusy(false);}
  }
  return <div className="tool-layout"><section className="panel tool-panel"><ToolIntro icon={Zap} kicker="HTTP STREAM · 03" title="Stream echo" description="Post content and read the response as the service streams it back." status={status}/><div className="tool-body"><div className="connection-note"><span className="connection-dot"/><span>Endpoint <code>POST /api/echo/stream</code></span><span className="note-separator">·</span><span>Authenticated HTTP</span></div><form className="form-stack" onSubmit={send}><label>Content type<select value={contentType} onChange={e=>setContentType(e.target.value)}><option value="text/plain">text/plain</option><option value="application/json">application/json</option><option value="application/octet-stream">application/octet-stream</option></select></label><label>Request body<textarea rows={7} value={content} onChange={e=>setContent(e.target.value)} placeholder="Enter the content to send…" required/></label><div className="stream-actions"><span className="field-hint">Response bytes are displayed as they arrive.</span><button className="primary-button" disabled={busy}><Send size={16}/>{busy?"Streaming…":"Send request"} <span>→</span></button></div></form>{error&&<div className="inline-error" role="alert">{error}</div>}{response!==""&&<div className="stream-response"><div className="response-header"><div><span className="eyebrow">STREAM RESPONSE</span><h3>Returned content</h3></div><span className="status-pill status-done"><CheckCircle2 size={13}/> Complete</span></div><div className="response-meta"><span>Content type</span><code>{responseType}</code><span>Characters</span><b>{response.length}</b></div><pre>{response}</pre><button className="secondary-button compact" onClick={()=>navigator.clipboard?.writeText(response)}><ClipboardList size={14}/> Copy response</button></div>}</div></section><section className="panel side-panel"><div className="side-panel-head"><div><h3><Activity size={17}/> Request details</h3><p>About this streaming request.</p></div></div><div className="detail-list"><div><span>Method</span><b className="method-pill">POST</b></div><div><span>Path</span><code>/api/echo/stream</code></div><div><span>Authentication</span><b>Bearer token + session</b></div><div><span>Response mode</span><b>Readable stream</b></div></div><div className="tip-card"><Sparkles size={16}/><div><b>Try different payloads</b><p>Switch the content type and send plain text, JSON text, or arbitrary text bytes to verify the echo response.</p></div></div></section></div>;
}

export default StreamEcho;
