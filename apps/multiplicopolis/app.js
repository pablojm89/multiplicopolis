/* ============================================================
   MULTIPLICÓPOLIS v1 · Tablas de multiplicar
   GitHub Pages + Apps Script + Google Sheets
   ============================================================ */
const DEFAULT_BACKEND_URL = "https://script.google.com/macros/s/AKfycbwb6KWTNcDfl0z9w0Je5lMpxyREFHWW8YOLAEEjSCL_CXy_NEEgNONVzES22S5Wnr281A/exec";
const TEACHER_PIN = "45612378";
const APP = "multiplicopolis";
const TABLES = Array.from({length:12},(_,i)=>i+1);
const FACTORS = Array.from({length:12},(_,i)=>i+1);
const GROUPS_DEFAULT = ["3.ºA","3.ºB","4.ºA","4.ºB","5.ºA","5.ºB","6.ºA","6.ºB"];
const AVATARS = ["🦊","🐼","🦉","🐸","🐯","🐵","🦁","🐰"]; // base (desbloqueados desde el inicio)
const AVATAR_LOCKED = [{e:"🐲",xp:200},{e:"🦄",xp:500},{e:"🚀",xp:950},{e:"🐉",xp:1500},{e:"⭐",xp:2000},{e:"👑",xp:3000}];
const allAvatars = () => [...AVATARS.map(e=>({e,xp:0})), ...AVATAR_LOCKED];
const avatarUnlocked = (s,e) => { const a=allAvatars().find(x=>x.e===e); return a ? (s.xp||0)>=a.xp : true; };
const RANKS = [
  {xp:0,name:"Aprendiz de Producto",icon:"🌱"},{xp:200,name:"Explorador de Tablas",icon:"🧭"},{xp:500,name:"Guardián del Cálculo",icon:"🛡️"},{xp:950,name:"Mago Multiplicador",icon:"🧙"},{xp:1500,name:"Leyenda de Multiplicópolis",icon:"🏆"}
];
const MODES = [
  ["normal","Resultado directo"],["reverse","Factor perdido"],["choice","Elige respuesta"],["truefalse","Verdadero o falso"],["speed","Reto rápido"]
];
/* ── CURRÍCULO 1º-6º Primaria ─────────────────────────────────────────────
   Cada CURSO es un "mundo" que se desbloquea al vencer al jefe del anterior.
   Cada nivel lleva un `spec` que describe qué tipo de operación genera:
     kind "fact"    → hecho de tabla (a×b)         · usa tables/modes
     kind "concept" → iniciación (grupos, doble…)  · se convierte en fact normal
     kind "column"  → multiplicación en columna    · aDigits/bDigits/carry/render
     kind "mixed"   → mezcla de parts[] (jefes)
   render: "step" = paso a paso guiado · "result" = solo resultado final
   ──────────────────────────────────────────────────────────────────────── */
const CURRICULUM = [
  { id:"c1", curso:"1º", name:"Plaza de los Grupos", emoji:"🧸", class:"w1",
    intro:"Multiplicar es sumar grupos iguales",
    levels:[
      {key:"c1-1", name:"Grupos iguales", emoji:"🍎", spec:{kind:"concept", sub:"repeat", max:5, rounds:8}},
      {key:"c1-2", name:"Cuenta de 2 en 2", emoji:"👣", spec:{kind:"concept", sub:"skip", step:2, rounds:8}},
      {key:"c1-3", name:"El doble", emoji:"✌️", spec:{kind:"concept", sub:"double", max:10, rounds:8}},
      {key:"c1-4", name:"Tabla del 2", emoji:"2️⃣", spec:{kind:"fact", tables:[2], modes:["normal","choice"], rounds:10}},
      {key:"c1-5", name:"Tabla del 10", emoji:"🔟", spec:{kind:"fact", tables:[10], modes:["normal","choice"], rounds:10}},
    ],
    boss:{name:"Guardián de los Grupos", emoji:"🧩", spec:{kind:"fact", tables:[2,10], modes:["normal","choice","truefalse"], rounds:10}} },

  { id:"c2", curso:"2º", name:"Mercado de las Tablas", emoji:"🛒", class:"w2",
    intro:"Aprende las primeras tablas y la propiedad conmutativa",
    levels:[
      {key:"c2-1", name:"Tabla del 5", emoji:"5️⃣", spec:{kind:"fact", tables:[5], rounds:10}},
      {key:"c2-2", name:"Tabla del 3", emoji:"3️⃣", spec:{kind:"fact", tables:[3], rounds:10}},
      {key:"c2-3", name:"Tabla del 4", emoji:"4️⃣", spec:{kind:"fact", tables:[4], rounds:10}},
      {key:"c2-4", name:"Conmutativa", emoji:"🔄", spec:{kind:"fact", tables:[2,3,4,5,10], modes:["reverse","truefalse"], rounds:10}},
      {key:"c2-5", name:"Mezcla fácil", emoji:"🎲", spec:{kind:"fact", tables:[2,3,4,5,10], modes:["normal","choice"], rounds:12}},
    ],
    boss:{name:"Jefe del Mercado", emoji:"👑", spec:{kind:"fact", tables:[2,3,4,5,10], modes:["normal","reverse","choice"], rounds:12}} },

  { id:"c3", curso:"3º", name:"Fábrica de Productos", emoji:"🏭", class:"w3",
    intro:"Domina todas las tablas y multiplica por una cifra con llevadas",
    levels:[
      {key:"c3-1", name:"Tabla del 6", emoji:"6️⃣", spec:{kind:"fact", tables:[6], rounds:10}},
      {key:"c3-2", name:"Tabla del 7", emoji:"7️⃣", spec:{kind:"fact", tables:[7], rounds:10}},
      {key:"c3-3", name:"Tabla del 8", emoji:"8️⃣", spec:{kind:"fact", tables:[8], rounds:10}},
      {key:"c3-4", name:"Tabla del 9", emoji:"9️⃣", spec:{kind:"fact", tables:[9], rounds:10}},
      {key:"c3-5", name:"Todas las tablas", emoji:"🌟", spec:{kind:"fact", tables:[2,3,4,5,6,7,8,9,10], modes:["normal","reverse","choice"], rounds:15}},
      {key:"c3-6", name:"2 cifras × 1 (sin llevar)", emoji:"📏", spec:{kind:"column", aDigits:[2,2], bDigits:[1,1], carry:false, render:"step", rounds:6}},
      {key:"c3-7", name:"2 cifras × 1 (con llevadas)", emoji:"🧗", spec:{kind:"column", aDigits:[2,2], bDigits:[1,1], carry:true, render:"step", rounds:6}},
      {key:"c3-8", name:"3 cifras × 1", emoji:"🏗️", spec:{kind:"column", aDigits:[3,3], bDigits:[1,1], carry:true, render:"step", rounds:6}},
    ],
    boss:{name:"Capataz de la Fábrica", emoji:"🦾", spec:{kind:"mixed", rounds:12, parts:[
      {kind:"fact", tables:[6,7,8,9], modes:["normal","reverse"]},
      {kind:"column", aDigits:[3,3], bDigits:[1,1], carry:true, render:"result"}]}} },

  { id:"c4", curso:"4º", name:"Torre de las Decenas", emoji:"🏙️", class:"w4",
    intro:"Multiplica por dos cifras y por la unidad seguida de ceros",
    levels:[
      {key:"c4-1", name:"× 10, 100 y 1000", emoji:"0️⃣", spec:{kind:"column", power10:true, render:"result", rounds:8}},
      {key:"c4-2", name:"2 cifras × 2 cifras", emoji:"🧱", spec:{kind:"column", aDigits:[2,2], bDigits:[2,2], carry:true, render:"step", rounds:6}},
      {key:"c4-3", name:"3 cifras × 2 cifras", emoji:"🏢", spec:{kind:"column", aDigits:[3,3], bDigits:[2,2], carry:true, render:"step", rounds:5}},
      {key:"c4-4", name:"Velocidad 2×2", emoji:"⚡", spec:{kind:"column", aDigits:[2,2], bDigits:[2,2], carry:true, render:"result", rounds:8}},
    ],
    boss:{name:"Vigía de la Torre", emoji:"🛰️", spec:{kind:"column", aDigits:[3,3], bDigits:[2,2], carry:true, render:"result", rounds:8}} },

  { id:"c5", curso:"5º", name:"Puerto de las Centenas", emoji:"⚓", class:"w5",
    intro:"Tres cifras, ceros intermedios y primeros decimales",
    levels:[
      {key:"c5-1", name:"3 cifras × 3 cifras", emoji:"🚢", spec:{kind:"column", aDigits:[3,3], bDigits:[3,3], carry:true, render:"step", rounds:5}},
      {key:"c5-2", name:"Con ceros intermedios", emoji:"🕳️", spec:{kind:"column", aDigits:[3,3], bDigits:[3,3], zeroMid:true, carry:true, render:"step", rounds:5}},
      {key:"c5-3", name:"Decimal × natural", emoji:"💧", spec:{kind:"column", decimalsA:[1,2], bDigits:[1,1], carry:true, render:"result", rounds:6}},
      {key:"c5-4", name:"Velocidad multicifra", emoji:"⚡", spec:{kind:"column", aDigits:[3,3], bDigits:[2,3], carry:true, render:"result", rounds:8}},
    ],
    boss:{name:"Capitán del Puerto", emoji:"🧭", spec:{kind:"column", aDigits:[3,3], bDigits:[3,3], carry:true, render:"result", rounds:8}} },

  { id:"c6", curso:"6º", name:"Cima de Multiplicópolis", emoji:"🏔️", class:"w6",
    intro:"Decimales, números grandes y maestría total",
    levels:[
      {key:"c6-1", name:"Decimal × decimal", emoji:"💠", spec:{kind:"column", decimalsA:[1,2], decimalsB:[1,1], carry:true, render:"result", rounds:6}},
      {key:"c6-2", name:"Números grandes", emoji:"🌌", spec:{kind:"column", aDigits:[4,4], bDigits:[2,3], carry:true, render:"result", rounds:6}},
      {key:"c6-3", name:"Reto experto", emoji:"🔥", spec:{kind:"column", aDigits:[3,4], bDigits:[3,3], carry:true, render:"result", rounds:8}},
    ],
    boss:{name:"Leyenda de Multiplicópolis", emoji:"🏆", spec:{kind:"column", aDigits:[4,4], bDigits:[3,3], carry:true, render:"result", rounds:10}} },
];

// Derivados planos para el resto de la app
const LEVELS = [];
CURRICULUM.forEach(c=>c.levels.forEach((l,idx)=>LEVELS.push({...l, id:l.key, curso:c.id, courseName:c.name, order:idx})));
const BOSSES = CURRICULUM.map(c=>({id:`boss-${c.id}`, curso:c.id, name:c.boss.name, emoji:c.boss.emoji, spec:c.boss.spec, courseName:c.name}));
const courseLevels = cid => LEVELS.filter(l=>l.curso===cid);
const courseBoss = cid => BOSSES.find(b=>b.curso===cid);
const courseDone = (s,cid) => (s.levels?.[`boss-${cid}`]?.stars||0) > 0;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const today = () => new Date().toISOString().slice(0,10);
const weekKey = () => { const d=new Date(); const onejan=new Date(d.getFullYear(),0,1); return `${d.getFullYear()}-S${Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7)}`; };
const norm = s => String(s||"").trim().toLowerCase();
const shuffle = a => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
const pick = a => a[Math.floor(Math.random()*a.length)];
const clampNumber = (n,min,max,fallback) => Number.isFinite(n) ? Math.min(max,Math.max(min,n)) : fallback;

let students = load("multiplicopolis-students", []);
let groups = load("multiplicopolis-groups", GROUPS_DEFAULT);
let settings = load("multiplicopolis-settings", { backendUrl: DEFAULT_BACKEND_URL, classCode:"Multiplicópolis Aula", accessible:false, quiet:false });
let missions = load("multiplicopolis-missions", {});
let exams = load("multiplicopolis-exams", []);
let grades = load("multiplicopolis-grades", []);
let queue = load("multiplicopolis-sync-queue", []);
let limits = load("multiplicopolis-limits", {}); // límite de curso por grupo: { "4.ºA": 4 }
let current = null;
let teacherUnlocked = sessionStorage.getItem("multiplicopolis-teacher") === "1";
let game = null;

function load(k, fallback){ try{return JSON.parse(localStorage.getItem(k)) ?? fallback}catch{return fallback} }
function save(k,v){ localStorage.setItem(k,JSON.stringify(v)); }
function saveAll(){ save("multiplicopolis-students",students); save("multiplicopolis-groups",groups); save("multiplicopolis-settings",settings); save("multiplicopolis-missions",missions); save("multiplicopolis-exams",exams); save("multiplicopolis-grades",grades); save("multiplicopolis-sync-queue",queue); save("multiplicopolis-limits",limits); }
function studentBase(name, group, pw){ return {id:uid(), name:name.trim(), group, password:pw.trim(), avatar:pick(AVATARS), xp:0, attempts:[], mistakes:{}, mastery:{}, levels:{}, bestStreak:0, days:{last:null,count:0}, createdAt:new Date().toISOString(), examsDone:{}, badges:[], updatedAt:new Date().toISOString()}; }
function rankFor(xp){ return [...RANKS].reverse().find(r=>xp>=r.xp) || RANKS[0]; }
function activeStudent(){ return students.find(s=>s.id===current); }
function selectedValues(sel){ return [...sel.selectedOptions].map(o=>Number(o.value)||o.value); }
function fillSelect(sel, arr, all=false){ sel.innerHTML = all?`<option value="all">Todos</option>`:""; arr.forEach(v=>sel.insertAdjacentHTML("beforeend",`<option value="${esc(v)}">${esc(v)}</option>`)); }
function fillGroups(){ ["#loginGroupFilter","#newStudentGroup","#missionGroup","#examGroup"].forEach(id=>fillSelect($(id), groups, id==="#loginGroupFilter")); ["#trainTables","#missionTables","#examTables"].forEach(id=>fillSelect($(id), TABLES)); ["#studyTable","#printTable"].forEach(id=>fillSelect($(id), TABLES)); $("#trainMode").innerHTML = MODES.map(m=>`<option value="${m[0]}">${m[1]}</option>`).join(""); }

function init(){ fillGroups(); bind(); applySettings(); renderLogin(); syncPullConfig(false); }
function bind(){
  $("#addStudentBtn").onclick=addStudent; $("#newStudentName").addEventListener("keydown",e=>{if(e.key==="Enter")addStudent()}); $("#loginGroupFilter").onchange=renderLogin; $("#teacherLoginBtn").onclick=()=>{ if(requestTeacher()) showApp("teacher"); };
  $$(".tab").forEach(b=>b.onclick=()=>showApp(b.dataset.view)); $("#switchStudentBtn").onclick=logout;
  $("#startTrainBtn").onclick=()=>startGame({source:"train"}); $("#studyTable").onchange=renderStudy; $("#studyView").onchange=renderStudy; $("#practiceMistakes").onclick=()=>startGame({source:"mistakes"});
  $("#trainKind").onchange=e=>{ const col=e.target.value==="column"; $("#tablesOptions").classList.toggle("hidden",col); $("#columnOptions").classList.toggle("hidden",!col); }; $("#labGoBtn").onclick=runColumnLab; $("#pullProgressBtn").onclick=()=>pullAllProgress(true);
  $("#forceSyncBtn").onclick=()=>syncQueue(true); $("#syncAllBtn").onclick=()=>syncQueue(true); $("#exportCsvBtn").onclick=exportProgress; $("#exportGradesBtn").onclick=exportGrades; $("#lockTeacherBtn").onclick=lockTeacher;
  $$(".teacher-nav").forEach(b=>b.onclick=()=>showTeacherPanel(b.dataset.panel)); $("#saveMissionBtn").onclick=saveMission; $("#clearMissionBtn").onclick=clearMission; $("#createExamBtn").onclick=createExam; $("#addGroupBtn").onclick=addGroup;
  $("#saveBackendBtn").onclick=saveSettings; $("#testBackendBtn").onclick=testBackend; $("#publishConfigBtn").onclick=publishConfig; $("#pullConfigBtn").onclick=()=>syncPullConfig(true); $("#accessibleToggle").onchange=e=>{settings.accessible=e.target.checked;saveAll();applySettings()}; $("#quietToggle").onchange=e=>{settings.quiet=e.target.checked;saveAll();applySettings()}; $("#makeWorksheetBtn").onclick=makeWorksheet;
}
function applySettings(){ document.body.classList.toggle("accessible",!!settings.accessible); document.body.classList.toggle("quiet",!!settings.quiet); $("#accessibleToggle").checked=!!settings.accessible; $("#quietToggle").checked=!!settings.quiet; $("#backendUrlInput").value=settings.backendUrl||""; $("#classCodeInput").value=settings.classCode||""; }

function renderLogin(){
  fillGroups(); const filter=$("#loginGroupFilter").value||"all"; const list = students.filter(s=>filter==="all"||s.group===filter);
  $("#studentGrid").innerHTML = list.length? list.map(s=>{const r=rankFor(s.xp); return `<button class="student-card" data-id="${s.id}"><span class="sc-avatar">${s.avatar}</span><strong>${esc(s.name)}</strong><small>${esc(s.group)}</small><span class="sc-rank">${r.icon} ${r.name}</span></button>`}).join("") : `<div class="callout">Aún no hay perfiles en este grupo.</div>`;
  $$(".student-card").forEach(b=>b.onclick=()=>loginStudent(b.dataset.id)); $("#loginSyncState").textContent = settings.backendUrl?"☁️ Conectado a Sheets":"💾 Modo local";
}
function addStudent(){ const name=$("#newStudentName").value.trim(); const group=$("#newStudentGroup").value; const pw=$("#newStudentPw").value.trim(); if(!name||!pw)return alert("Escribe nombre y contraseña."); if(students.some(s=>norm(s.name)===norm(name)&&s.group===group))return alert("Ya existe un perfil con ese nombre en ese grupo."); const s=studentBase(name,group,pw); students.push(s); enqueue("student",s); saveAll(); $("#newStudentName").value=""; $("#newStudentPw").value=""; renderLogin(); }
function loginStudent(id){ const s=students.find(x=>x.id===id); if(!s)return; const pw=prompt(`Contraseña de ${s.name}`); if(pw===null)return; if(pw!==s.password)return alert("Contraseña incorrecta. Pregunta a tu maestro/a si no la recuerdas."); current=id; updateDay(s); saveAll(); $("#loginScreen").classList.add("hidden"); $("#appShell").classList.remove("hidden"); renderApp(); showApp("adventure"); syncQueue(false); pullStudentProgress(s).then(ok=>{ if(ok && current===id){ renderApp(); } }); }
function logout(){ const s=activeStudent(); if(s) pushProgress(s); syncQueue(false); current=null; $("#appShell").classList.add("hidden"); $("#loginScreen").classList.remove("hidden"); renderLogin(); }
function updateDay(s){ const t=today(); if(s.days.last!==t){ const y=new Date(); y.setDate(y.getDate()-1); s.days.count = s.days.last===y.toISOString().slice(0,10)?(s.days.count||0)+1:1; s.days.last=t; } }

function showApp(view){ if(view==="teacher"&&!teacherUnlocked){ if(!requestTeacher())return; } $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${view}`)); $$(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===view)); if(view!=="teacher")renderApp(); else renderTeacher(); }
function requestTeacher(){ const c=prompt("Código de maestro/a"); if(c===null)return false; if(c===TEACHER_PIN){teacherUnlocked=true;sessionStorage.setItem("multiplicopolis-teacher","1");return true} alert("Código incorrecto"); return false; }
function lockTeacher(){ teacherUnlocked=false;sessionStorage.removeItem("multiplicopolis-teacher");showApp("adventure"); }
function showTeacherPanel(p){ $$(".teacher-nav").forEach(b=>b.classList.toggle("active",b.dataset.panel===p)); $$(".teacher-panel").forEach(x=>x.classList.toggle("active",x.id===`panel-${p}`)); renderTeacher(); }

function renderApp(){ const s=activeStudent(); if(!s)return; const r=rankFor(s.xp); $("#playerName").textContent=s.name; $("#groupLabel").textContent=`· ${s.group}`; $("#playerAvatar").textContent=s.avatar; $("#rankName").textContent=`${r.icon} ${r.name}`; $("#dailyStreak").textContent=`🔥 ${s.days.count||1} día${(s.days.count||1)>1?'s':''}`; $("#xpText").textContent=`${s.xp} XP`; $("#xpBar").style.width=`${Math.min(100,(s.xp%500)/5)}%`; renderMission(); renderWorldMap(); renderStudy(); renderReview(); renderProgress(); renderExamTab(); }
function renderMission(){ const s=activeStudent(); const m=missions[s.group]; const el=$("#missionBanner"); if(!m){el.classList.add("hidden");return} el.classList.remove("hidden"); const what = m.spec ? `Operación: ${contentLabel(m.content)}` : `Tablas: ${(m.tables||[]).join(", ")}`; el.innerHTML=`<div><strong>🎯 Misión de hoy: ${esc(m.title||"Entrena tablas")}</strong><br><small>${what} · ${m.rounds} preguntas · XP doble</small></div><button class="secondary" id="startMissionBtn">Empezar misión</button>`; $("#startMissionBtn").onclick=()=>startGame({source:"mission", mission:m}); }
function curriculumStars(s){ return [...LEVELS,...BOSSES].reduce((a,n)=>a+(s.levels?.[n.id]?.stars||0),0); }
function courseUnlocked(s,ci){ if(ci>0 && !courseDone(s,CURRICULUM[ci-1].id)) return false; const lim=limits[s.group]; if(lim && (ci+1)>lim) return false; return true; }
function renderWorldMap(){
  const s=activeStudent(); const maxStars=(LEVELS.length+BOSSES.length)*3;
  $("#starCount").textContent=`⭐ ${curriculumStars(s)}/${maxStars}`;
  $("#worldMap").innerHTML=CURRICULUM.map((c,ci)=>{
    const nodes=courseLevels(c.id), boss=courseBoss(c.id);
    const limited = limits[s.group] && (ci+1)>limits[s.group];
    const locked = !courseUnlocked(s,ci);
    const cStars = nodes.reduce((a,l)=>a+(s.levels?.[l.id]?.stars||0),0)+(s.levels?.[boss.id]?.stars||0);
    return `<article class="world ${c.class} ${locked?'locked':''}"><div class="world-head"><span class="world-emoji">${limited?'🚧':c.emoji}</span><div><h3>${c.curso} · ${esc(c.name)}</h3><small>${limited?'🚧 Aún no desbloqueado por tu maestro/a':esc(c.intro)}</small></div><span class="world-stars">⭐ ${cStars}/${(nodes.length+1)*3}</span></div><div class="level-path">${nodes.map((l,i)=>levelNode(l,locked,s,i,nodes)).join("")}${bossNode(boss,locked,s,nodes)}</div></article>`;
  }).join("");
  $$(".level-node:not(.boss-node):not(.locked)").forEach(b=>b.onclick=()=>startGame({source:"level", level:LEVELS.find(l=>l.id===b.dataset.id)}));
  $$(".boss-node:not(.locked)").forEach(b=>b.onclick=()=>startGame({source:"boss", boss:BOSSES.find(x=>x.id===b.dataset.id)}));
}
function levelNode(l, worldLocked, s, i, nodes){ const prev = i===0 || (s.levels?.[nodes[i-1].id]?.stars||0)>0; const locked=worldLocked||!prev; const st=s.levels?.[l.id]?.stars||0; return `<button class="level-node ${locked?'locked':''} ${st===0&&!locked?'current':''}" data-id="${l.id}" title="${esc(l.name)}"><span class="em">${locked?'🔒':l.emoji}</span><strong>${esc(l.name)}</strong><span class="stars">${'⭐'.repeat(st)}${'☆'.repeat(3-st)}</span></button>`; }
function bossNode(b, worldLocked, s, nodes){ const ready=nodes.every(l=>(s.levels?.[l.id]?.stars||0)>0); const locked=worldLocked||!ready; const st=s.levels?.[b.id]?.stars||0; return `<button class="level-node boss-node ${locked?'locked':''} ${ready&&st===0&&!worldLocked?'current':''}" data-id="${b.id}" title="${esc(b.name)}"><span class="em">${locked?'🔒':b.emoji}</span><strong>${esc(b.name)}</strong><span class="stars">${'⭐'.repeat(st)}${'☆'.repeat(3-st)}</span></button>`; }
function renderStudy(){ const t=Number($("#studyTable").value||1), mode=$("#studyView").value; $("#tableStudy").innerHTML = FACTORS.map(f=>`<div class="mult-row"><span>${t} × ${f}</span><strong class="${mode==='hide'?'hidden-result':''}">${t*f}</strong>${mode==='groups'?`<small>${f} grupos de ${t}</small>`:""}</div>`).join(""); }
function renderReview(){ const s=activeStudent(); const entries=Object.entries(s.mistakes||{}).sort((a,b)=>b[1]-a[1]); $("#reviewCount").textContent=entries.length; $("#mistakeList").innerHTML= entries.length?entries.slice(0,20).map(([k,n])=>`<div class="mistake"><strong>${k.replace('x',' × ')}</strong> · ${n} fallo${n>1?'s':''}</div>`).join(""):`<div class="callout">No hay errores pendientes. ¡Buen trabajo!</div>`; }
function renderProgress(){ const s=activeStudent(); const stats=calcStats(s); $("#statXp").textContent=s.xp; $("#statAcc").textContent=`${stats.acc}%`; $("#statBest").textContent=s.bestStreak||0; $("#statSolved").textContent=stats.total; $("#masteryBars").innerHTML=TABLES.map(t=>{ const m=tableMastery(s,t); return `<div class="bar-line"><div class="bar-label"><span>Tabla del ${t}</span><span>${m}%</span></div><div class="bar"><span style="width:${m}%"></span></div></div>`}).join(""); renderBadges(s); renderAvatarPicker(s); renderPodium(); renderLog(); }
function renderPodium(){ const s=activeStudent(); const wk=weekKey(); const list=students.filter(x=>x.group===s.group).map(x=>({name:x.name,avatar:x.avatar,xp:x.attempts.filter(a=>a.week===wk).reduce((n,a)=>n+(a.xp||0),0)})).sort((a,b)=>b.xp-a.xp).slice(0,5); $("#podium").innerHTML=list.map((p,i)=>`<div class="podium-item"><span>${["🥇","🥈","🥉","⭐","⭐"][i]} ${p.avatar} ${esc(p.name)}</span><span>${p.xp} XP</span></div>`).join("")||"<p class='tiny'>Aún no hay actividad esta semana.</p>"; }
function renderLog(){ const s=activeStudent(); $("#activityLog").innerHTML=[...(s.attempts||[])].slice(-10).reverse().map(a=>`<div class="activity"><strong>${a.correct}/${a.total}</strong> · ${a.source} · ${a.tables?.join(', ')||''}<br><small>${new Date(a.at).toLocaleString()}</small></div>`).join("")||"<p class='tiny'>Todavía no hay actividad.</p>"; }
function renderExamTab(){ const s=activeStudent(); const available=exams.filter(e=>e.group===s.group && !s.examsDone[e.id]); $("#examTab").classList.toggle("hidden",available.length===0); $("#examList").innerHTML=available.length?available.map(e=>`<div class="exam-row"><strong>${esc(e.title)}</strong><br><small>${e.spec?('Columna · '+contentLabel(e.content)):('Tablas '+(e.tables||[]).join(', '))} · ${e.n} preguntas</small><br><button class="primary small" data-exam="${e.id}">Hacer examen</button></div>`).join(""):`<div class="callout">No tienes exámenes pendientes.</div>`; $$('[data-exam]').forEach(b=>b.onclick=()=>startGame({source:"exam",exam:exams.find(e=>e.id===b.dataset.exam)})); }

/* ── Motor de problemas ──────────────────────────────────────────────────── */
const randBetween = ([lo,hi]) => lo + Math.floor(Math.random()*(hi-lo+1));
const intWithDigits = d => { const lo = d<=1?1:10**(d-1), hi = 10**d-1; return lo + Math.floor(Math.random()*(hi-lo+1)); };
const zeroMidInt = d => { // entero de d cifras con la del medio a 0 (d=3 -> H0U)
  const h=1+Math.floor(Math.random()*9), u=1+Math.floor(Math.random()*9); return d>=3 ? h*100+u : h*10+u;
};
function fmtDec(int, dec){ if(!dec) return String(int); const s=String(int).padStart(dec+1,'0'); return s.slice(0,-dec)+','+s.slice(-dec); }
function decForm(aInt, decA, bInt, decB){ const prodInt=aInt*bInt, decP=decA+decB; return {
  a:aInt/10**decA, b:bInt/10**decB, aStr:fmtDec(aInt,decA), bStr:fmtDec(bInt,decB), decA, decB,
  aInt, bInt, product:prodInt/10**decP, productStr:fmtDec(prodInt,decP) }; }
function needRegen(spec,a,b,bDig){
  const dig = s=>String(s).split('').map(Number);
  if(spec.carry===false) return dig(b).some(db=>dig(a).some(da=>da*db>=10)); // queremos CERO llevadas
  if(spec.carry===true && bDig===1) return !dig(a).some(da=>da*b>=10);        // queremos alguna llevada
  return false;
}
function genColumnOperands(spec){
  if(spec.power10){ const b=pick([10,100,1000]); const a=intWithDigits(pick([2,3])); return decForm(a,0,b,0); }
  const decA = spec.decimalsA ? randBetween(spec.decimalsA) : 0;
  const decB = spec.decimalsB ? randBetween(spec.decimalsB) : 0;
  const aDig = spec.decimalsA ? pick([2,3]) : randBetween(spec.aDigits||[2,2]);
  const bDig = spec.decimalsB ? pick([1,2]) : randBetween(spec.bDigits||[1,1]);
  let a,b,t=0;
  do{ a=intWithDigits(aDig); b=(spec.zeroMid&&bDig>=3)?zeroMidInt(bDig):intWithDigits(bDig); t++; }
  while(needRegen(spec,a,b,bDig) && t<80);
  return decForm(a,decA,b,decB);
}
function makeColumn(spec){ return {type:"column", render:spec.render||"result", spec, ...genColumnOperands(spec)}; }
function makeConcept(spec){
  if(spec.sub==="double"){ const v=1+Math.floor(Math.random()*spec.max); return {type:"fact",mode:"normal",a:2,b:v,ans:2*v,correct:2*v,prompt:`El doble de ${v}`}; }
  if(spec.sub==="skip"){ const st=spec.step, k=2+Math.floor(Math.random()*6); const seq=Array.from({length:k},(_,i)=>(i+1)*st); const next=(k+1)*st; return {type:"fact",mode:"normal",a:st,b:k+1,ans:next,correct:next,prompt:`${seq.join(", ")}, ?`}; }
  const v=2+Math.floor(Math.random()*4), n=2+Math.floor(Math.random()*Math.max(1,spec.max-1));
  const groups=Array.from({length:n},()=>"🟡".repeat(v)).join("&nbsp;&nbsp;");
  return {type:"fact",mode:"normal",a:n,b:v,ans:n*v,correct:n*v,prompt:`${n} veces ${v}`,sub:groups};
}
function makeProblem(spec){
  let s=spec; if(spec.kind==="mixed") s=pick(spec.parts);
  if(s.kind==="concept") return makeConcept(s);
  if(s.kind==="column")  return makeColumn(s);
  return {type:"fact", ...makeQuestion(s.tables||TABLES, pick(s.modes||["normal"]))};
}
function buildQuestions(spec){ const n=spec.rounds||10; return Array.from({length:n},()=>makeProblem(spec)); }

function makeQuestion(tables, mode){ const a=pick(tables), b=pick(FACTORS), ans=a*b; if(mode==="reverse"){ const missing=Math.random()<.5?"a":"b"; return {mode, a,b,ans, prompt: missing==="a"?`? × ${b} = ${ans}`:`${a} × ? = ${ans}`, correct: missing==="a"?a:b}; } if(mode==="choice"){ const opts=shuffle([ans, ans+a, Math.max(0,ans-b), ans+10, ans-a]).filter((v,i,ar)=>ar.indexOf(v)===i).slice(0,4); return {mode,a,b,ans,prompt:`${a} × ${b}`, correct:ans, opts:shuffle(opts)}; } if(mode==="truefalse"){ const shown=Math.random()<.55?ans:ans+pick([-10,-5,-3,-2,2,3,5,10]); return {mode,a,b,ans,prompt:`${a} × ${b} = ${shown}`, correct:shown===ans, shown}; } return {mode:"normal",a,b,ans,prompt:`${a} × ${b}`,correct:ans}; }
function startGame(cfg){
  const s=activeStudent(); if(!s && cfg.source!=="preview")return;
  let qs, tables=[], rounds, mode, spec=null, source=cfg.source;
  if(cfg.level) spec=cfg.level.spec;
  else if(cfg.boss) spec=cfg.boss.spec;
  else if(cfg.mission){ if(cfg.mission.spec) spec=cfg.mission.spec; else { tables=cfg.mission.tables; rounds=clampNumber(Number(cfg.mission.rounds),5,30,10); mode="normal"; } }
  else if(cfg.source==="mistakes"){ const keys=Object.keys(s.mistakes||{}); if(!keys.length)return alert("No tienes errores pendientes."); tables=[...new Set(keys.map(k=>Number(k.split('x')[0])))].filter(Boolean); rounds=Math.min(20,Math.max(8,keys.length)); mode="normal"; }
  else if(cfg.exam){ if(cfg.exam.spec) spec=cfg.exam.spec; else { tables=cfg.exam.tables; rounds=clampNumber(Number(cfg.exam.n),5,50,20); mode="mixed"; } }
  else { const kind=$("#trainKind")?.value||"tables"; rounds=clampNumber(Number($("#rounds").value),5,40,10); if(kind==="column"){ const a=Number($("#colA").value)||2, b=Number($("#colB").value)||1; spec={kind:"column", aDigits:[a,a], bDigits:[b,b], carry:$("#colCarry").checked, render:$("#colRender").value||"step", rounds}; } else { tables=[...selectedValues($("#trainTables"))].filter(Number); mode=$("#trainMode").value||"normal"; } }
  if(spec){ qs=buildQuestions(spec); rounds=qs.length; tables=spec.tables||[]; mode=spec.kind; }
  else { if(!tables.length)tables=TABLES; qs=Array.from({length:rounds},()=>({type:"fact", ...makeQuestion(tables, mode==="mixed"?pick(["normal","reverse","choice","truefalse"]):mode)})); }
  game={cfg,tables,rounds,mode,qs,i:0,correct:0,streak:0,best:0,answers:[],source,answering:false};
  document.body.classList.add("playing"); $("#gameOverlay").classList.remove("hidden"); renderQuestion();
}
function renderQuestion(){
  game.answering=false; const q=game.qs[game.i]; const pct=(game.i/game.rounds)*100;
  const titles={exam:'📝 Examen',boss:'👑 Jefe final',level:'🗺️ Nivel',mission:'🎯 Misión'};
  $("#gameOverlay").innerHTML=`<div class="game-frame"><div class="game-top"><button class="ghost small" id="closeGame">Salir</button><h3>${titles[game.source]||'⚡ Entrenamiento'}</h3><strong>${game.correct} ✅</strong></div><div class="hud"><span>${game.i+1}/${game.rounds}</span><div class="game-progress"><span style="width:${pct}%"></span></div><span>🔥 ${game.streak}</span></div><div id="qArea"></div><div id="feedback" class="feedback"></div></div>`;
  $("#closeGame").onclick=endGameEarly;
  if(q.type==="column") return renderColumn(q);
  renderFact(q);
}
function renderFact(q){
  const area=$("#qArea");
  if(q.mode==="choice") area.innerHTML=`<p class="prompt">Elige el resultado</p><div class="question">${q.prompt}</div><div class="options">${q.opts.map(o=>`<button class="option" data-v="${o}">${o}</button>`).join("")}</div>`;
  else if(q.mode==="truefalse") area.innerHTML=`<p class="prompt">¿Es correcto?</p><div class="question">${q.prompt}</div><div class="options"><button class="option" data-v="true">Verdadero</button><button class="option" data-v="false">Falso</button></div>`;
  else area.innerHTML=`<p class="prompt">Resuelve</p><div class="question">${q.prompt}</div>${q.sub?`<div class="concept-vis">${q.sub}</div>`:''}<div class="answer-row"><input id="answerInput" inputmode="numeric" autocomplete="off" autofocus><button id="checkBtn" class="primary">Comprobar</button></div>`;
  $$(".option").forEach(b=>b.onclick=()=>checkAnswer(b.dataset.v));
  const inp=$("#answerInput"); if(inp){inp.focus(); $("#checkBtn").onclick=()=>checkAnswer(inp.value); inp.addEventListener("keydown",e=>{if(e.key==="Enter")checkAnswer(inp.value)});}
}
function registerOutcome(q, ok, answerVal){
  if(ok){ game.correct++; game.streak++; game.best=Math.max(game.best,game.streak); } else game.streak=0;
  game.answers.push({type:q.type||"fact", a:q.a, b:q.b, answer:answerVal, correct:q.correct ?? q.productStr, ok});
}
function advance(ok){ setTimeout(()=>{ game.i++; if(game.i>=game.rounds)finishGame(); else renderQuestion(); }, ok?700:1100); }
function checkAnswer(v){
  if(game.answering)return; game.answering=true;
  $$(".option").forEach(o=>o.disabled=true); const btn=$("#checkBtn"); if(btn)btn.disabled=true; const inp=$("#answerInput"); if(inp)inp.disabled=true;
  const q=game.qs[game.i]; const val = q.mode==="truefalse" ? (v==="true") : Number(v); const ok = val===q.correct;
  if(ok) feedback("¡Correcto!",true); else feedback(`Casi. Era ${q.correct===true?'verdadero':q.correct===false?'falso':q.correct}`,false);
  registerOutcome(q, ok, val);
  if(q.mode==="choice"||q.mode==="truefalse"){ $$(".option").forEach(o=>{ const ov=q.mode==="truefalse"?(o.dataset.v==="true"):Number(o.dataset.v); o.classList.add(ov===q.correct?"correct":(ov===val?"wrong":"")); }); }
  advance(ok);
}

/* ── Multiplicación en columna ───────────────────────────────────────────── */
function fillRight(arr,str,width){ const start=width-str.length; str.split('').forEach((ch,i)=>arr[start+i]=`<span class="cell ${ch===','?'comma':''}">${ch}</span>`); }
function renderColumn(q){
  const integer = q.decA===0 && q.decB===0;
  if(q.render==="step" && integer && q.bStr.length===1) return renderColumnStep1(q);
  if(q.render==="step" && integer && q.bStr.length>=2) return renderColumnStepN(q);
  return renderColumnResult(q);
}
function renderColumnResult(q){
  const area=$("#qArea"); const width=Math.max(q.aStr.length, q.bStr.length+1, q.productStr.length);
  const aCells=Array(width).fill('<span class="cell"></span>'); fillRight(aCells,q.aStr,width);
  const bCells=Array(width).fill('<span class="cell"></span>'); fillRight(bCells,q.bStr,width); bCells[0]='<span class="cell op-sign">×</span>';
  area.innerHTML=`<p class="prompt">Calcula el resultado</p><div class="col-op"><div class="col-row">${aCells.join('')}</div><div class="col-row">${bCells.join('')}</div><div class="col-rule"></div></div><div class="answer-row"><input id="answerInput" class="col-final" inputmode="decimal" autocomplete="off" autofocus placeholder="?"><button id="checkBtn" class="primary">Comprobar</button></div>`;
  const inp=$("#answerInput"); inp.focus(); const submit=()=>checkColumnResult(q, inp.value);
  $("#checkBtn").onclick=submit; inp.onkeydown=e=>{ if(e.key==="Enter")submit(); };
}
function checkColumnResult(q, raw){
  if(game.answering)return; game.answering=true;
  const inp=$("#answerInput"); if(inp)inp.disabled=true; const btn=$("#checkBtn"); if(btn)btn.disabled=true;
  const val=Number(String(raw).trim().replace(',','.')); const ok=Math.abs(val-q.product)<1e-9;
  if(ok) feedback("¡Correcto! 🎉",true); else feedback(`Casi. Era ${q.productStr}`,false);
  registerOutcome(q, ok, q.productStr); advance(ok);
}
function columnSteps(aStr,b){
  const ds=aStr.split('').map(Number), L=ds.length; let carry=0; const fills=[];
  for(let i=0;i<L;i++){ const p=ds[L-1-i]*b+carry; const res=p%10; carry=Math.floor(p/10); fills.push({kind:'res',col:i,val:res}); if(carry>0) fills.push({kind:'carry',col:i+1,val:carry}); }
  if(carry>0) fills.push({kind:'res',col:L,val:carry});
  return fills;
}
function renderColumnStep1(q){
  const fills=columnSteps(q.aStr, q.bInt), N=Math.max(...fills.map(f=>f.col))+1, dpos=col=>N-1-col;
  game.cs={q,fills,idx:0,hadError:false};
  const carry=Array(N).fill('<span class="cell"></span>'), res=Array(N).fill('<span class="cell"></span>');
  fills.forEach(f=>{ const dp=dpos(f.col); if(f.kind==='carry') carry[dp]=`<input class="cell ccarry" id="cs-car-${f.col}" inputmode="numeric" maxlength="1" disabled>`; else res[dp]=`<input class="cell cres" id="cs-res-${f.col}" inputmode="numeric" maxlength="1" disabled>`; });
  const aArr=Array(N).fill('<span class="cell"></span>'); fillRight(aArr,q.aStr,N);
  const bArr=Array(N).fill('<span class="cell"></span>'); bArr[dpos(0)]=`<span class="cell">${q.bStr}</span>`; bArr[0]='<span class="cell op-sign">×</span>';
  $("#qArea").innerHTML=`<p class="prompt">Resuelve por columnas, de derecha a izquierda</p><div class="col-op step"><div class="col-row carryline">${carry.join('')}</div><div class="col-row">${aArr.join('')}</div><div class="col-row">${bArr.join('')}</div><div class="col-rule"></div><div class="col-row">${res.join('')}</div></div><p class="col-hint" id="colHint"></p>`;
  activateColCell();
}
function activateColCell(){
  const cs=game.cs; if(cs.idx>=cs.fills.length) return finishColumn();
  const f=cs.fills[cs.idx]; const inp=$(f.kind==='carry'?`#cs-car-${f.col}`:`#cs-res-${f.col}`);
  $$('.col-op input').forEach(x=>x.classList.remove('active'));
  inp.disabled=false; inp.classList.add('active'); inp.focus();
  $("#colHint").textContent = f.kind==='carry' ? "⬆️ Escribe la llevada encima de la siguiente columna" : "Escribe la cifra del resultado de esta columna";
  const apply=()=>{ const v=inp.value.trim(); if(v==='')return; if(Number(v)===f.val){ inp.classList.remove('active','wrong'); inp.classList.add('done'); inp.disabled=true; cs.idx++; activateColCell(); } else { cs.hadError=true; inp.classList.add('wrong'); feedback("Revisa esa cifra",false); setTimeout(()=>{inp.value='';inp.classList.remove('wrong');inp.focus();},650); } };
  inp.oninput=()=>{ if(inp.value.length>=1) apply(); };
  inp.onkeydown=e=>{ if(e.key==='Enter') apply(); };
}
function renderColumnStepN(q){
  const bD=q.bStr.split('').map(Number);
  const partials=bD.map((_,k)=>{ const d=bD[bD.length-1-k]; return {val:q.aInt*d, digit:d, shift:k}; });
  game.cs={q,partials,stage:0,phase:'partial',hadError:false};
  const rows=partials.map((p,k)=>`<div class="col-row partial"><input class="col-final partial-in" id="cs-p-${k}" inputmode="numeric" autocomplete="off" placeholder="${q.aStr}×${p.digit}" disabled>${'<span class="cell shift">·</span>'.repeat(k)}</div>`).join('');
  $("#qArea").innerHTML=`<p class="prompt">Multiplica por cada cifra y luego suma</p><div class="col-op stepN"><div class="col-row big">${q.aStr}</div><div class="col-row big"><span class="op-sign">×</span> ${q.bStr}</div><div class="col-rule"></div>${rows}<div class="col-rule"></div><div class="col-row"><input class="col-final" id="cs-sum" inputmode="numeric" autocomplete="off" placeholder="Suma total" disabled></div></div><p class="col-hint" id="colHint"></p>`;
  activatePartial();
}
function activatePartial(){
  const cs=game.cs;
  if(cs.phase==='partial'){
    if(cs.stage>=cs.partials.length){ cs.phase='sum'; return activatePartial(); }
    const k=cs.stage, p=cs.partials[k], inp=$(`#cs-p-${k}`);
    $$('.col-op input').forEach(x=>x.classList.remove('active'));
    inp.disabled=false; inp.classList.add('active'); inp.focus();
    $("#colHint").textContent=`Escribe ${cs.q.aStr} × ${p.digit}`;
    bindStepInput(inp, p.val, ()=>{ cs.stage++; activatePartial(); });
  } else {
    const inp=$("#cs-sum"); $$('.col-op input').forEach(x=>x.classList.remove('active'));
    inp.disabled=false; inp.classList.add('active'); inp.focus();
    $("#colHint").textContent='Suma los productos parciales';
    bindStepInput(inp, cs.q.product, ()=>finishColumn());
  }
}
function bindStepInput(inp, target, onok){
  const cs=game.cs;
  const check=()=>{ const v=inp.value.trim().replace(',','.'); if(v==='')return; if(Math.abs(Number(v)-target)<1e-9){ inp.classList.remove('active','wrong'); inp.classList.add('done'); inp.disabled=true; onok(); } else { cs.hadError=true; inp.classList.add('wrong'); feedback("Revisa ese número",false); setTimeout(()=>{inp.classList.remove('wrong');inp.focus();inp.select();},650); } };
  inp.onkeydown=e=>{ if(e.key==='Enter')check(); };
}
function finishColumn(){
  if(game.answering)return; game.answering=true;
  const cs=game.cs, ok=!cs.hadError;
  if(ok) feedback("¡Multiplicación perfecta! 🎉",true); else feedback(`Resuelta. Resultado: ${cs.q.productStr}`,false);
  registerOutcome(cs.q, ok, cs.q.productStr); advance(ok);
}
function feedback(msg, ok){ const f=$("#feedback"); f.textContent=msg; f.className=`feedback ${ok?'good':'bad'}`; }
function endGameEarly(){ if(confirm("¿Salir del reto?")){document.body.classList.remove("playing");$("#gameOverlay").classList.add("hidden");} }
function finishGame(){ const s=activeStudent(); const total=game.rounds, correct=game.correct, acc=Math.round(correct/total*100); const isExam=game.source==="exam"; const xp = isExam?0:Math.max(5,correct*8*(game.source==="mission"?2:1)); const stars=acc>=90?3:acc>=70?2:acc>=50?1:0; if(s){ s.xp+=xp; s.bestStreak=Math.max(s.bestStreak||0,game.best); const attempt={id:uid(),app:APP,studentId:s.id,name:s.name,group:s.group,source:game.source,at:new Date().toISOString(),week:weekKey(),tables:game.tables,total,correct,acc,xp,answers:game.answers}; s.attempts.push(attempt); game.answers.forEach(a=>{ if(a.type && a.type!=="fact")return; const key=`${a.a}x${a.b}`; if(a.ok){ if(s.mistakes[key]){s.mistakes[key]--; if(s.mistakes[key]<=0)delete s.mistakes[key];} } else s.mistakes[key]=(s.mistakes[key]||0)+1; }); (game.tables||[]).forEach(t=>updateMastery(s,t)); if(game.cfg.level){ const id=game.cfg.level.id; const old=s.levels[id]?.stars||0; s.levels[id]={stars:Math.max(old,stars),best:Math.max(s.levels[id]?.best||0,acc)}; } if(game.cfg.boss){ const id=game.cfg.boss.id; const old=s.levels[id]?.stars||0; s.levels[id]={stars:Math.max(old,stars),best:Math.max(s.levels[id]?.best||0,acc)}; } if(isExam){ const e=game.cfg.exam; const grade=Number((correct/total*10).toFixed(1)); const g={id:uid(),examId:e.id,title:e.title,studentId:s.id,name:s.name,group:s.group,at:new Date().toISOString(),tables:game.tables,total,correct,grade,answers:game.answers}; grades.push(g); s.examsDone[e.id]=true; enqueue("grade",g); } const newBadges=evaluateBadges(s); enqueue("attempt",attempt); pushProgress(s); if(newBadges.length) badgeToast(newBadges); }
  $("#gameOverlay").innerHTML=`<div class="game-frame end"><div class="emoji">${acc>=80?'🏆':acc>=50?'⭐':'💪'}</div><h2>${isExam?'Examen terminado':game.source==='boss'?'Jefe final completado':'Reto completado'}</h2>${isExam?`<div class="grade ${acc>=50?'ok':'bad'}">${(correct/total*10).toFixed(1)}</div>`:`<div class="question">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div><p>+${xp} XP</p>`}<p>${correct}/${total} correctas · ${acc}%</p><button id="endOk" class="primary big">Continuar</button></div>`; $("#endOk").onclick=()=>{document.body.classList.remove("playing");$("#gameOverlay").classList.add("hidden");renderApp();}; syncQueue(false); }
function updateMastery(s,t){ const attempts=(s.attempts||[]).flatMap(a=>a.answers||[]).filter(x=>x.a===t||x.b===t).slice(-30); const acc=attempts.length?Math.round(attempts.filter(x=>x.ok).length/attempts.length*100):0; s.mastery[t]=acc; }
function tableMastery(s,t){ return s.mastery?.[t] || 0; }
function calcStats(s){ const total=(s.attempts||[]).reduce((n,a)=>n+a.total,0); const correct=(s.attempts||[]).reduce((n,a)=>n+a.correct,0); return {total,correct,acc:total?Math.round(correct/total*100):0}; }

/* ── Contenido de misiones/exámenes (tablas u operaciones en columna) ──────── */
const COLUMN_CONTENT = {'col-2x1':[2,1],'col-3x1':[3,1],'col-2x2':[2,2],'col-3x2':[3,2],'col-3x3':[3,3]};
function contentSpec(value, rounds){ const m=COLUMN_CONTENT[value]; if(!m) return null; const [a,b]=m; return {kind:"column", aDigits:[a,a], bDigits:[b,b], carry:true, render:"result", rounds}; }
function contentLabel(value){ const map={'col-2x1':'2 cifras × 1','col-3x1':'3 cifras × 1','col-2x2':'2 cifras × 2','col-3x2':'3 cifras × 2','col-3x3':'3 cifras × 3'}; return map[value]||null; }

/* ── Insignias ─────────────────────────────────────────────────────────────── */
const BADGES=[
  {id:"first",   icon:"🎓", name:"Primer nivel",        desc:"Completa tu primer nivel",            test:s=>levelsCleared(s)>=1},
  {id:"ten",     icon:"🔟", name:"Diez niveles",         desc:"Completa 10 niveles",                 test:s=>levelsCleared(s)>=10},
  {id:"streak",  icon:"🔥", name:"Racha ardiente",       desc:"Encadena 10 aciertos seguidos",       test:s=>(s.bestStreak||0)>=10},
  {id:"perfect", icon:"💯", name:"Perfeccionista",       desc:"Consigue 3⭐ en un nivel",            test:s=>Object.values(s.levels||{}).some(l=>(l.stars||0)>=3)},
  {id:"column",  icon:"🧱", name:"Constructor",          desc:"Termina las operaciones de 3º",        test:s=>(s.levels?.['c3-8']?.stars||0)>0},
  {id:"twodigit",icon:"🏢", name:"Doble cifra",          desc:"Multiplica por dos cifras (4º)",       test:s=>(s.levels?.['c4-2']?.stars||0)>0},
  {id:"decimals",icon:"💧", name:"Decimales",            desc:"Resuelve con decimales (5º)",          test:s=>(s.levels?.['c5-3']?.stars||0)>0},
  {id:"c3",      icon:"🏭", name:"Maestro de 3º",        desc:"Vence al jefe de 3º",                  test:s=>courseDone(s,'c3')},
  {id:"c4",      icon:"🏙️", name:"Maestro de 4º",        desc:"Vence al jefe de 4º",                  test:s=>courseDone(s,'c4')},
  {id:"c5",      icon:"⚓", name:"Maestro de 5º",        desc:"Vence al jefe de 5º",                  test:s=>courseDone(s,'c5')},
  {id:"legend",  icon:"🏆", name:"Leyenda",              desc:"Vence al jefe final de 6º",            test:s=>courseDone(s,'c6')},
  {id:"stars30", icon:"⭐", name:"Coleccionista",        desc:"Consigue 30 estrellas",                test:s=>curriculumStars(s)>=30},
];
function levelsCleared(s){ return [...LEVELS,...BOSSES].filter(n=>(s.levels?.[n.id]?.stars||0)>0).length; }
function evaluateBadges(s){ s.badges=s.badges||[]; const got=[]; BADGES.forEach(b=>{ if(!s.badges.includes(b.id) && b.test(s)){ s.badges.push(b.id); got.push(b); } }); return got; }
function badgeToast(list){ if(!list.length)return; const t=document.createElement('div'); t.className='badge-toast'; t.innerHTML=list.map(b=>`<div class="toast-badge"><span class="tb-ic">${b.icon}</span><div><strong>¡Insignia desbloqueada!</strong><br>${esc(b.name)}</div></div>`).join(''); document.body.appendChild(t); requestAnimationFrame(()=>t.classList.add('show')); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),400); }, 3400); }
function renderBadges(s){ const have=new Set(s.badges||[]); $("#badgeGrid").innerHTML=BADGES.map(b=>{ const got=have.has(b.id); return `<div class="badge-chip ${got?'got':'locked'}" title="${esc(b.desc)}"><span class="bc-ic">${got?b.icon:'🔒'}</span><small>${esc(b.name)}</small></div>`; }).join(""); }
function renderAvatarPicker(s){ $("#avatarPicker").innerHTML=allAvatars().map(a=>{ const ok=avatarUnlocked(s,a.e), sel=s.avatar===a.e; return `<button class="av-opt ${sel?'sel':''} ${ok?'':'locked'}" data-av="${a.e}" ${ok?'':'disabled'} title="${ok?'Elegir':'Necesitas '+a.xp+' XP'}">${ok?a.e:'🔒'}</button>`; }).join(""); $$('.av-opt:not(.locked)').forEach(b=>b.onclick=()=>{ const s2=activeStudent(); if(!s2)return; s2.avatar=b.dataset.av; saveAll(); renderApp(); pushProgress(s2); }); }

/* ── Laboratorio de la columna (resuelta, solo lectura) ────────────────────── */
function runColumnLab(){ const a=Math.max(0,parseInt($("#labA").value)||0), b=Math.max(0,parseInt($("#labB").value)||0); $("#labResult").innerHTML=solvedColumnHTML(String(a),String(b)); }
function solvedColumnHTML(aStr,bStr){
  const a=Number(aStr), b=Number(bStr); if(!a||!b) return '<div class="callout">Escribe dos números mayores que cero.</div>';
  const product=a*b;
  if(bStr.length===1){
    const fills=columnSteps(aStr,b), N=Math.max(...fills.map(f=>f.col))+1, dpos=c=>N-1-c;
    const carry=Array(N).fill('<span class="cell"></span>'), res=Array(N).fill('<span class="cell"></span>');
    fills.forEach(f=>{ const dp=dpos(f.col); if(f.kind==='carry') carry[dp]=`<span class="cell ccarry-s">${f.val}</span>`; else res[dp]=`<span class="cell cres-s">${f.val}</span>`; });
    const aArr=Array(N).fill('<span class="cell"></span>'); fillRight(aArr,aStr,N);
    const bArr=Array(N).fill('<span class="cell"></span>'); bArr[dpos(0)]=`<span class="cell">${bStr}</span>`; bArr[0]='<span class="cell op-sign">×</span>';
    return `<div class="col-op solved"><div class="col-row carryline">${carry.join('')}</div><div class="col-row">${aArr.join('')}</div><div class="col-row">${bArr.join('')}</div><div class="col-rule"></div><div class="col-row">${res.join('')}</div></div>`;
  }
  const bD=bStr.split('').map(Number);
  const rows=bD.map((_,k)=>{ const d=bD[bD.length-1-k]; return `<div class="col-row partial big">${a*d}${'<span class="cell shift">·</span>'.repeat(k)}</div>`; }).join('');
  return `<div class="col-op solved"><div class="col-row big">${aStr}</div><div class="col-row big"><span class="op-sign">×</span> ${bStr}</div><div class="col-rule"></div>${rows}<div class="col-rule"></div><div class="col-row big result">${product}</div></div>`;
}

/* ── Límite de curso por grupo ─────────────────────────────────────────────── */
function renderLimits(){ $("#limitList").innerHTML = groups.length? groups.map(g=>{ const v=limits[g]||0; return `<div class="limit-row"><strong>${esc(g)}</strong><select data-limgroup="${esc(g)}" class="lim-sel"><option value="0">Sin límite · 1º a 6º</option>${CURRICULUM.map((c,i)=>`<option value="${i+1}" ${v===i+1?'selected':''}>Hasta ${c.curso} (${esc(c.name)})</option>`).join('')}</select></div>`; }).join("") : "<p class='tiny'>Sin grupos.</p>"; $$('.lim-sel').forEach(sel=>sel.onchange=()=>{ const g=sel.dataset.limgroup, v=Number(sel.value); if(v) limits[g]=v; else delete limits[g]; saveAll(); }); }

/* ── Mapa de calor: alumno × curso ─────────────────────────────────────────── */
function renderHeat(){
  const maxC=CURRICULUM.map(c=>(courseLevels(c.id).length+1)*3);
  if(!students.length){ $("#masteryHeat").innerHTML="<p class='tiny'>Sin alumnado todavía.</p>"; return; }
  $("#masteryHeat").innerHTML=`<div class="heatmap"><div class="heat-row head"><span class="hr-name"></span>${CURRICULUM.map(c=>`<span title="${esc(c.name)}">${c.curso}</span>`).join('')}</div>${students.map(s=>`<div class="heat-row"><span class="hr-name">${s.avatar} ${esc(s.name)}</span>${CURRICULUM.map((c,i)=>{ const got=courseLevels(c.id).reduce((a,l)=>a+(s.levels?.[l.id]?.stars||0),0)+(s.levels?.[`boss-${c.id}`]?.stars||0); const pct=Math.round(got/maxC[i]*100); const cls=pct>=70?'ok':pct>=30?'mid':pct>0?'low':'none'; return `<span class="heat-cell ${cls}" title="${esc(c.name)}: ${pct}%">${pct?pct:'·'}</span>`; }).join('')}</div>`).join('')}</div>`;
}

/* ── Mochila en la nube (progreso viajero) ─────────────────────────────────── */
function snapshotProgress(s){ return {studentId:s.id, name:s.name, group:s.group, avatar:s.avatar, xp:s.xp, levels:s.levels, mistakes:s.mistakes, mastery:s.mastery, bestStreak:s.bestStreak, badges:s.badges||[], days:s.days, examsDone:s.examsDone, updatedAt:s.updatedAt}; }
function pushProgress(s){ if(!s)return; s.updatedAt=new Date().toISOString(); saveAll(); enqueue("progress", snapshotProgress(s)); }
function mergeProgress(s,p){ s.xp=p.xp??s.xp; s.levels=p.levels||s.levels; s.mistakes=p.mistakes||s.mistakes; s.mastery=p.mastery||s.mastery; s.bestStreak=Math.max(s.bestStreak||0,p.bestStreak||0); s.badges=p.badges||s.badges; s.examsDone=p.examsDone||s.examsDone; s.avatar=p.avatar||s.avatar; s.days=p.days||s.days; s.updatedAt=p.updatedAt; }
async function pullStudentProgress(s){ if(!settings.backendUrl||!s)return false; try{ const url=settings.backendUrl+`?app=${encodeURIComponent(APP)}&classCode=${encodeURIComponent(settings.classCode)}&type=progress&studentId=${encodeURIComponent(s.id)}`; const r=await fetch(url); const d=await r.json(); if(d.ok && d.progress && (!s.updatedAt || d.progress.updatedAt>s.updatedAt)){ mergeProgress(s,d.progress); saveAll(); return true; } }catch(e){} return false; }
async function pullAllProgress(manual){ if(!settings.backendUrl){ if(manual)alert("Configura primero la URL del backend en Ajustes."); return; } let n=0; for(const s of students){ if(await pullStudentProgress(s)) n++; } renderTeacher(); if(manual)alert(`Progreso actualizado de ${n} alumno/a(s).`); }

function renderTeacher(){ fillGroups(); renderClassSummary(); renderHeat(); renderMissions(); renderExamManage(); renderStudents(); renderLimits(); }
function renderClassSummary(){ const rows=students.map(s=>{const st=calcStats(s);return {...s,stats:st}}); $("#classSummary").innerHTML=`<table class="table"><thead><tr><th>Alumno/a</th><th>Grupo</th><th>Clave</th><th>XP</th><th>Acierto</th><th>Errores</th></tr></thead><tbody>${rows.map(s=>`<tr><td>${s.avatar} ${esc(s.name)}</td><td>${esc(s.group)}</td><td><code>${esc(s.password||'')}</code></td><td>${s.xp}</td><td>${s.stats.acc}%</td><td>${Object.keys(s.mistakes||{}).length}</td></tr>`).join("")}</tbody></table>`; const weak=[]; students.forEach(s=>TABLES.forEach(t=>{if((s.mastery?.[t]||0)<50 && (s.attempts||[]).length>0)weak.push(`${s.name}: tabla ${t}`)})); $("#teacherRadar").innerHTML=weak.length?weak.slice(0,12).map(w=>`<div class="mistake">${esc(w)}</div>`).join(""):`<div class="callout">Sin alertas todavía.</div>`; }
function renderMissions(){ $("#missionList").innerHTML=Object.entries(missions).map(([g,m])=>`<div class="activity"><strong>${esc(g)}</strong>: ${esc(m.title)} · ${m.spec?('columna '+contentLabel(m.content)):('tablas '+(m.tables||[]).join(', '))}</div>`).join("")||"<p class='tiny'>Sin misiones guardadas.</p>"; }
function saveMission(){ const g=$("#missionGroup").value; const tables=selectedValues($("#missionTables")).filter(Number); const content=$("#missionContent").value; const rounds=Number($("#missionRounds").value)||10; const spec=contentSpec(content,rounds); missions[g]={title:$("#missionTitle").value.trim()||"Misión de tablas", tables:tables.length?tables:TABLES, rounds, content, spec}; saveAll(); renderTeacher(); }
function clearMission(){ delete missions[$("#missionGroup").value]; saveAll(); renderTeacher(); }
function createExam(){ const tables=selectedValues($("#examTables")).filter(Number); const n=Number($("#examN").value)||20; const content=$("#examContent").value; const spec=contentSpec(content,n); const e={id:uid(),title:$("#examTitle").value.trim()||"Evaluación de tablas", group:$("#examGroup").value, tables:tables.length?tables:TABLES, n, content, spec, timer:$("#examTimer").checked, createdAt:new Date().toISOString()}; exams.push(e); saveAll(); renderTeacher(); }
function renderExamManage(){ $("#examManageList").innerHTML=exams.map(e=>`<div class="exam-row"><strong>${esc(e.title)}</strong> · ${esc(e.group)} · ${e.spec?('columna '+contentLabel(e.content)):('tablas '+(e.tables||[]).join(', '))}<br><small>Notas: ${grades.filter(g=>g.examId===e.id).length}</small></div>`).join("")||"<p class='tiny'>No hay evaluaciones.</p>"; }
function addGroup(){ const g=$("#newGroupName").value.trim(); if(!g)return; if(!groups.includes(g))groups.push(g); $("#newGroupName").value=""; saveAll(); fillGroups(); renderTeacher(); }
function renderStudents(){ const by=Object.groupBy?Object.groupBy(students,s=>s.group):students.reduce((a,s)=>((a[s.group]??=[]).push(s),a),{}); $("#groupStudentList").innerHTML=Object.entries(by).map(([g,arr])=>`<h3>${esc(g)}</h3>${arr.map(s=>`<div class="student-row">${s.avatar} <strong>${esc(s.name)}</strong> · clave: <code>${esc(s.password||'')}</code> · ${s.xp} XP</div>`).join("")}`).join("")||"<p class='tiny'>Sin alumnado.</p>"; }
function makeWorksheet(){ const t=Number($("#printTable").value||1); const qs=shuffle(FACTORS).map(f=>`${t} × ${f} = ______`); $("#worksheet").innerHTML=`<h2>Ficha · Tabla del ${t}</h2><p>Nombre: ____________________ Fecha: ____________</p>${qs.map(q=>`<p style="font-size:1.35rem">${q}</p>`).join("")}`; }

function saveSettings(){ settings.backendUrl=$("#backendUrlInput").value.trim(); settings.classCode=$("#classCodeInput").value.trim()||"Multiplicópolis Aula"; saveAll(); alert("Ajustes guardados"); }
function enqueue(type,payload){ queue.push({type,payload,app:APP,at:new Date().toISOString()}); saveAll(); }
async function post(payload){ if(!settings.backendUrl)throw new Error("Sin URL backend"); const body=JSON.stringify({app:APP,classCode:settings.classCode,...payload}); await fetch(settings.backendUrl,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body}); return true; }
async function syncQueue(manual){ if(!queue.length){ if(manual)alert("No hay datos pendientes."); return; } const copy=[...queue]; try{ await post({type:"batch",items:copy}); queue=[]; saveAll(); if(manual)alert("Sincronizado."); }catch(e){ if(manual)alert("No se pudo sincronizar. Queda en cola."); } }
async function testBackend(){ try{ await post({type:"ping",payload:{time:new Date().toISOString()}}); alert("Conexión enviada. Comprueba la hoja si quieres verificar registro."); }catch(e){ alert("No se pudo conectar."); } }
async function publishConfig(){ try{ await post({type:"config",payload:{missions,exams,groups,limits,settings:{classCode:settings.classCode}}}); alert("Configuración publicada al aula."); }catch(e){ alert("No se pudo publicar."); } }
async function syncPullConfig(manual){ if(!settings.backendUrl)return; try{ const url=settings.backendUrl+`?app=${encodeURIComponent(APP)}&classCode=${encodeURIComponent(settings.classCode)}&type=config`; const r=await fetch(url); const data=await r.json(); if(data.ok&&data.config){ missions=data.config.missions||missions; exams=data.config.exams||exams; groups=data.config.groups||groups; limits=data.config.limits||limits; saveAll(); fillGroups(); if(manual)alert("Configuración descargada."); } }catch(e){ if(manual)alert("No se pudo descargar configuración."); } }
window.addEventListener("beforeunload",()=>{ const s=activeStudent(); if(s) pushProgress(s); });
function exportProgress(){ downloadCsv("multiplicopolis_progreso.csv", students.flatMap(s=>(s.attempts||[]).map(a=>({alumno:s.name,grupo:s.group,fecha:a.at,tablas:(a.tables||[]).join('|'),total:a.total,correctas:a.correct,acierto:a.acc,xp:a.xp,tipo:a.source})))); }
function exportGrades(){ downloadCsv("multiplicopolis_notas.csv", grades.map(g=>({alumno:g.name,grupo:g.group,examen:g.title,fecha:g.at,nota:g.grade,total:g.total,correctas:g.correct,tablas:g.tables.join('|')}))); }
function downloadCsv(name, rows){ if(!rows.length)return alert("No hay datos."); const keys=Object.keys(rows[0]); const csv=[keys.join(';'),...rows.map(r=>keys.map(k=>`"${String(r[k]??'').replaceAll('"','""')}"`).join(';'))].join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); a.download=name; a.click(); }
function esc(s){ return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }

init();
