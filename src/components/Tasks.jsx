import React, { useCallback, useEffect, useState } from "react";
import { Activity, ArrowDownUp, Check, CheckCircle2, ChevronDown, ClipboardList, Plus, RefreshCw, Search, Settings2, Trash2, X } from "lucide-react";
import { request } from "../api.js";

function Tasks({ token, onError, notify }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true); onError("");
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("completed", filter === "completed" ? "true" : "false");
      if (query.trim()) params.set("q", query.trim());
      const data = await request(`/api/tasks${params.size ? `?${params}` : ""}`, { token });
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch(e) { onError(e.message); }
    finally { setLoading(false); }
  }, [token, filter, query, onError]);
  useEffect(() => { const t = window.setTimeout(loadTasks, query ? 250 : 0); return () => window.clearTimeout(t); }, [loadTasks, query]);

  async function saveTask(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = { title: String(form.get("title") || "").trim(), description: String(form.get("description") || "").trim(), completed: Boolean(modal?.task?.completed) };
    if (!body.title) return;
    setSaving(true); onError("");
    try {
      if (modal.task) await request(`/api/tasks/${modal.task.id}`, { method: "PATCH", token, body: JSON.stringify(body) });
      else await request("/api/tasks", { method: "POST", token, body: JSON.stringify(body) });
      setModal(null); await loadTasks(); notify(modal.task ? "Task updated successfully" : "Task created successfully");
    } catch(e) { onError(e.message); }
    finally { setSaving(false); }
  }
  async function toggleTask(task) {
    try { await request(`/api/tasks/${task.id}`, { method: "PATCH", token, body: JSON.stringify({ completed: !task.completed }) }); await loadTasks(); }
    catch(e) { onError(e.message); }
  }
  async function deleteTask(task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    try { await request(`/api/tasks/${task.id}`, { method: "DELETE", token }); await loadTasks(); notify("Task deleted"); }
    catch(e) { onError(e.message); }
  }
  const completed = tasks.filter(t=>t.completed).length;
  const total = tasks.length;
  const percent = total ? Math.round(completed/total*100) : 0;

  return <>
    <div className="stats-grid">
      <StatCard icon={ClipboardList} label="Tasks found" value={total} note="In this session" tone="violet"/>
      <StatCard icon={CheckCircle2} label="Completed" value={completed} note={`${percent}% of visible tasks`} tone="green"/>
      <StatCard icon={Activity} label="In progress" value={total-completed} note="Ready for your attention" tone="blue"/>
      <div className="stat-card progress-stat"><div className="stat-top"><span>Completion rate</span><span className="progress-icon"><ArrowDownUp size={16}/></span></div><div className="stat-value">{percent}<small>%</small></div><div className="progress-track"><span style={{width:`${percent}%`}}/></div><div className="stat-note">Based on current results</div></div>
    </div>
    <section className="panel task-panel">
      <div className="panel-header"><div><div className="panel-title"><h2>Your tasks</h2><span className="count-badge">{total}</span></div><p>Manage the tasks tied to your current login session.</p></div><button className="primary-button" onClick={()=>setModal({task:null})}><Plus size={17}/> New task</button></div>
      <div className="task-toolbar"><div className="search-field"><Search size={17}/><input aria-label="Search tasks" placeholder="Search tasks..." value={query} onChange={e=>setQuery(e.target.value)}/>{query && <button className="icon-button" onClick={()=>setQuery("")} aria-label="Clear search"><X size={14}/></button>}</div><div className="filter-wrap"><Settings2 size={16}/><select aria-label="Filter tasks" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All tasks</option><option value="active">In progress</option><option value="completed">Completed</option></select><ChevronDown size={14}/></div><button className="icon-button refresh-button" onClick={loadTasks} title="Refresh tasks" aria-label="Refresh tasks"><RefreshCw size={17}/></button></div>
      <div className="task-list">
        {loading ? <div className="loading-state"><span className="spinner dark-spinner"/> Loading tasks…</div> : tasks.length === 0 ? <div className="empty-state"><div className="empty-icon"><ClipboardList size={23}/></div><h3>No tasks found</h3><p>{query || filter!=="all" ? "Try changing your search or filter." : "Create your first task to get started."}</p>{!query && filter==="all" && <button className="secondary-button" onClick={()=>setModal({task:null})}><Plus size={15}/> Create a task</button>}</div> : tasks.map((task,i)=><article className={`task-row ${task.completed?"task-completed":""}`} key={task.id}><button className={`task-check ${task.completed?"checked":""}`} onClick={()=>toggleTask(task)} aria-label={task.completed?"Mark task in progress":"Mark task completed"}>{task.completed && <Check size={14}/>}</button><div className="task-main"><div className="task-name-line"><h3>{task.title}</h3><span className={`status-pill ${task.completed?"status-done":"status-progress"}`}>{task.completed?"Completed":"In progress"}</span></div><p>{task.description || "No description provided."}</p><div className="task-meta"><span><span className="tiny-dot"/> Task #{task.id}</span>{task.updated_at && <span>Updated {formatDate(task.updated_at)}</span>}</div></div><div className="task-actions"><button className="icon-button" onClick={()=>setModal({task})} aria-label={`Edit ${task.title}`} title="Edit task"><Settings2 size={16}/></button><button className="icon-button danger-hover" onClick={()=>deleteTask(task)} aria-label={`Delete ${task.title}`} title="Delete task"><Trash2 size={16}/></button></div></article>)}
      </div>
      <div className="panel-bottom"><span>Showing <b>{tasks.length}</b> task{tasks.length===1?"":"s"}</span><span><span className="footer-dot"/> Changes sync with the service</span></div>
    </section>
    {modal && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title"><div className="modal-head"><div><span className="eyebrow">TASK DETAILS</span><h2 id="task-modal-title">{modal.task?"Edit task":"Create a task"}</h2></div><button className="icon-button" onClick={()=>setModal(null)} aria-label="Close modal"><X size={18}/></button></div><form onSubmit={saveTask} className="form-stack"><label>Task title<input name="title" defaultValue={modal.task?.title||""} maxLength={120} placeholder="e.g. Review API documentation" required autoFocus/></label><label>Description <span className="optional-label">OPTIONAL</span><textarea name="description" defaultValue={modal.task?.description||""} maxLength={2000} rows={4} placeholder="Add some context for this task…"/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setModal(null)}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving?<><span className="spinner"/> Saving…</>:<><Check size={16}/>{modal.task?"Save changes":"Create task"}</>}</button></div></form></section></div>}
  </>;
}

function formatDate(value) { try { return new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric"}).format(new Date(value)); } catch { return value; } }

function StatCard({icon:Icon,label,value,note,tone}) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={17}/></span></div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>; }

export default Tasks;
