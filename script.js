const STORAGE_KEY = "listafacil_tarefas_v1";
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentFilter = "all";
let statusFilter = "all";
const $ = (id) => document.getElementById(id);
const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset()*60000).toISOString().slice(0,10);
$("todayDate").textContent = today.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
$("taskDate").value = localDate;

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); render(); }
function formatDate(date){ if(!date) return "Sem prazo"; return new Date(date+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}); }
function openForm(){ $("taskForm").classList.remove("hidden"); $("taskName").focus(); }
function closeForm(){ $("taskForm").classList.add("hidden"); }
$("openForm").addEventListener("click",openForm);
$("emptyAdd").addEventListener("click",openForm);
$("closeForm").addEventListener("click",closeForm);
$("taskForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const name=$("taskName").value.trim(); if(!name) return;
  tasks.unshift({id:Date.now(),name,date:$("taskDate").value,category:$("taskCategory").value,done:false});
  $("taskName").value=""; $("taskDate").value=localDate; $("taskCategory").value="Geral"; closeForm(); save();
});
document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active"); currentFilter=btn.dataset.filter;
  $("listTitle").textContent={all:"Todas as tarefas",today:"Para hoje",done:"Tarefas concluídas"}[currentFilter];
  render();
}));
document.querySelectorAll(".pill").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".pill").forEach(x=>x.classList.remove("selected"));
  btn.classList.add("selected"); statusFilter=btn.dataset.status; render();
}));
$("searchInput").addEventListener("input",render);
function render(){
  const q=$("searchInput").value.toLowerCase().trim();
  const done=tasks.filter(t=>t.done).length;
  $("statTotal").textContent=tasks.length; $("statDone").textContent=done; $("statPending").textContent=tasks.length-done;
  $("allCount").textContent=tasks.length; $("todayCount").textContent=tasks.filter(t=>t.date===localDate&&!t.done).length;
  let shown=tasks.filter(t=>{
    if(currentFilter==="today" && (t.date!==localDate || t.done)) return false;
    if(currentFilter==="done" && !t.done) return false;
    if(statusFilter==="pending" && t.done) return false;
    if(statusFilter==="done" && !t.done) return false;
    return t.name.toLowerCase().includes(q)||t.category.toLowerCase().includes(q);
  });
  $("taskList").innerHTML="";
  shown.forEach(t=>{
    const row=document.createElement("div"); row.className="task-row"+(t.done?" completed":"");
    const check=document.createElement("button"); check.className="check"+(t.done?" checked":""); check.textContent=t.done?"✓":""; check.setAttribute("aria-label",t.done?"Marcar como pendente":"Concluir tarefa"); check.addEventListener("click",()=>{t.done=!t.done;save();});
    const copy=document.createElement("div"); copy.className="task-copy";
    const name=document.createElement("span"); name.className="task-name"; name.textContent=t.name;
    const meta=document.createElement("div"); meta.className="task-meta";
    const cat=document.createElement("span"); cat.className="category"; cat.textContent=t.category;
    const date=document.createElement("span"); date.textContent=t.date?"Prazo: "+formatDate(t.date):"Sem prazo";
    meta.append(cat,date); copy.append(name,meta);
    const del=document.createElement("button"); del.className="delete-btn"; del.textContent="×"; del.title="Excluir tarefa"; del.addEventListener("click",()=>{if(confirm("Excluir esta tarefa?")){tasks=tasks.filter(x=>x.id!==t.id);save();}});
    row.append(check,copy,del); $("taskList").append(row);
  });
  $("emptyState").classList.toggle("hidden",shown.length!==0);
  $("taskList").classList.toggle("hidden",shown.length===0);
}
if(tasks.length===0){
  tasks=[
    {id:1,name:"Organizar as atividades da semana",date:localDate,category:"Pessoal",done:false},
    {id:2,name:"Revisar o conteúdo da próxima aula",date:localDate,category:"Estudos",done:false},
    {id:3,name:"Separar documentos importantes",date:"",category:"Geral",done:true}
  ]; save();
}else render();
