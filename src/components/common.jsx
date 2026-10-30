import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Zap } from "lucide-react";

export function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return <div className="error-banner" role="alert"><span>{message}</span><button className="icon-button" onClick={onClose} aria-label="Dismiss error"><X size={16}/></button></div>;
}

export function useSocket(url, token, authFirst = false) {
  const socketRef = useRef(null);
  const [status, setStatus] = useState("disconnected");
  const [messages, setMessages] = useState([]);
  const [lastError, setLastError] = useState("");
  const connect = useCallback(() => {
    if (socketRef.current && [WebSocket.OPEN,WebSocket.CONNECTING].includes(socketRef.current.readyState)) return;
    setLastError(""); setStatus("connecting");
    let socket;
    try { socket = new WebSocket(url); } catch(e) { setStatus("error"); setLastError(e.message); return; }
    socketRef.current = socket;
    socket.onopen = () => {
      if (authFirst) socket.send(JSON.stringify({token}));
      else setStatus("connected");
    };
    socket.onmessage = (event) => {
      let data = event.data;
      try { data = JSON.parse(event.data); } catch {}
      if (data?.type === "ready") { setStatus("connected"); return; }
      if (data?.error) { setLastError(typeof data.error==="string"?data.error:"Service returned an error"); setStatus("error"); return; }
      setMessages(old => [...old, {id:Date.now()+Math.random(), direction:"received", text:typeof data==="string"?data:JSON.stringify(data), time:new Date()}]);
    };
    socket.onerror = () => { setLastError("WebSocket connection failed. Check the service and try reconnecting."); setStatus("error"); };
    socket.onclose = () => { setStatus(s => s==="error"?"error":"disconnected"); };
  }, [url, token, authFirst]);
  const send = useCallback((payload) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) throw new Error("Connect to the service before sending a request.");
    socketRef.current.send(typeof payload==="string"?payload:JSON.stringify(payload));
  }, []);
  const disconnect = useCallback(() => { socketRef.current?.close(); socketRef.current = null; setStatus("disconnected"); }, []);
  useEffect(() => () => socketRef.current?.close(), []);
  return {status,messages,setMessages,lastError,connect,send,disconnect};
}

export function StatusPill({status}) { const label={connected:"Connected",connecting:"Connecting",disconnected:"Disconnected",error:"Connection error"}[status]||status; return <span className={`connection-pill connection-${status}`}><span className="connection-dot"/>{label}</span>; }

export function ToolIntro({icon:Icon,kicker,title,description,status,action,actionLabel,actionIcon:ActionIcon}) {
  return <div className="tool-intro"><div className="tool-icon"><Icon size={22}/></div><div className="tool-copy"><span className="eyebrow">{kicker}</span><h2>{title}</h2><p>{description}</p></div><div className="tool-status"><StatusPill status={status}/>{action && <button className="secondary-button compact" onClick={action}>{ActionIcon&&<ActionIcon size={15}/ >}{actionLabel}</button>}</div></div>;
}
