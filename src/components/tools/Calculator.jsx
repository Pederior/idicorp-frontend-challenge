import React, { useEffect, useMemo, useState } from "react";
import { Activity, Calculator as CalculatorIcon, CheckCircle2, Plus, Sparkles, X, Zap } from "lucide-react";
import { apiBase } from "../../api.js";
import { useSocket, ToolIntro } from "../common.jsx";

function Calculator({token,onError,notify}) {
  const ws = useSocket(`${apiBase.replace(/^http/,"ws")}/ws/calculator`,token,true);
  const [operation,setOperation] = useState("add");
  const [numbers,setNumbers] = useState(["12","8"]);
  const [result,setResult] = useState(null);
  const [busy,setBusy] = useState(false);
  const [history,setHistory] = useState([]);
  const [localError,setLocalError] = useState("");
  useEffect(()=>{if(ws.status==="connected")notify("Calculator connected");},[ws.status]);
  useEffect(()=>{if(ws.lastError)onError(ws.lastError);},[ws.lastError,onError]);
  function updateNumber(i,v){setNumbers(old=>old.map((n,index)=>index===i?v:n));}
  function addNumber(){if(numbers.length<100)setNumbers(old=>[...old,""]);}
  function removeNumber(i){if(numbers.length>1)setNumbers(old=>old.filter((_,index)=>index!==i));}
  function calculate(e) {
    e.preventDefault(); setLocalError(""); setResult(null);
    const parsed=numbers.map(n=>n.trim()===""?NaN:Number(n));
    if(parsed.some(n=>!Number.isFinite(n)||Math.abs(n)>1e12)){setLocalError("Enter finite numbers between −1,000,000,000,000 and 1,000,000,000,000.");return;}
    if(operation==="divide"&&parsed.slice(1).some(n=>n===0)){setLocalError("Division by zero is not allowed.");return;}
    try {setBusy(true);ws.send({operation,numbers:parsed});setHistory(h=>[{operation,numbers:parsed,createdAt:new Date()},...h].slice(0,5));}
    catch(e){setLocalError(e.message);}
    finally{setBusy(false);}
  }
  const receiveResult = useMemo(()=>ws.messages.find(m=>m.direction==="received"&&m.text.includes('"result"')),[ws.messages]);
  useEffect(()=>{if(receiveResult){try{const d=JSON.parse(receiveResult.text);if(typeof d.result==="number")setResult(d.result);}catch{}}},[receiveResult]);
  return <div className="tool-layout"><section className="panel tool-panel"><ToolIntro icon={CalculatorIcon} kicker="WEBSOCKET TOOL · 01" title="Calculator" description="Perform arithmetic over a live, authenticated connection." status={ws.status} action={ws.status==="connected"?ws.disconnect:ws.connect} actionLabel={ws.status==="connected"?"Disconnect":"Connect"} actionIcon={ws.status==="connected"?X:Zap}/><div className="tool-body"><div className="connection-note"><span className="connection-dot"/><span>Endpoint <code>/ws/calculator</code></span><span className="note-separator">·</span><span>Token-authenticated</span></div><form onSubmit={calculate}><label className="field-label">Operation</label><div className="operation-grid">{[["add","＋","Add"],["subtract","−","Subtract"],["multiply","×","Multiply"],["divide","÷","Divide"]].map(([key,symbol,label])=><button key={key} type="button" className={`operation-choice ${operation===key?"operation-selected":""}`} onClick={()=>setOperation(key)}><span>{symbol}</span>{label}</button>)}</div><div className="field-heading"><label className="field-label">Numbers <span className="optional-label">1–100 VALUES</span></label><button type="button" className="text-button" onClick={addNumber} disabled={numbers.length>=100}><Plus size={14}/> Add number</button></div><div className="number-list">{numbers.map((number,i)=><div className="number-input-row" key={i}><span className="number-index">{String(i+1).padStart(2,"0")}</span><input type="number" step="any" value={number} onChange={e=>updateNumber(i,e.target.value)} aria-label={`Number ${i+1}`} placeholder="Enter a number" required/><button type="button" className="icon-button" disabled={numbers.length===1} onClick={()=>removeNumber(i)} aria-label={`Remove number ${i+1}`}><X size={15}/></button></div>)}</div>{localError&&<div className="inline-error" role="alert">{localError}</div>}<button className="primary-button" type="submit" disabled={busy||ws.status!=="connected"}><CalculatorIcon size={16}/> Calculate result <span>→</span></button></form>{result!==null&&<div className="result-card"><div><span className="eyebrow">CALCULATION RESULT</span><div className="result-value">{Number(result).toLocaleString(undefined,{maximumFractionDigits:8})}</div></div><div className="result-check"><CheckCircle2 size={20}/><span>Success</span></div></div>}</div></section><section className="panel side-panel"><div className="side-panel-head"><div><h3><Activity size={17}/> Recent calculations</h3><p>Your latest requests in this view.</p></div><span className="count-badge">{history.length}</span></div>{history.length? <div className="history-list">{history.map((h,i)=><div className="history-row" key={i}><span className="history-operation">{h.operation}</span><div><b>{h.numbers.join(` ${({add:"+",subtract:"−",multiply:"×",divide:"÷"})[h.operation]} `)}</b><small>{h.createdAt.toLocaleTimeString()}</small></div></div>)}</div>:<div className="mini-empty"><div className="empty-icon"><CalculatorIcon size={20}/></div><b>No calculations yet</b><p>Your recent requests will appear here.</p></div>}<div className="tip-card"><Sparkles size={16}/><div><b>Quick tip</b><p>Connect first, then enter one or more numbers and choose an operation.</p></div></div></section></div>;
}

export default Calculator;
