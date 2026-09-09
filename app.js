/* ============================================================
   KNOWTRIENTS — shared UI behaviors
   ============================================================ */

// ---- Marketing drawer (public site) ----
function initDrawer(){
  const brand = document.getElementById("brandTrigger");
  const drawer = document.getElementById("drawer");
  const scrim = document.getElementById("drawerScrim");
  if(!brand || !drawer || !scrim) return;

  function open(){ drawer.classList.add("open"); scrim.classList.add("open"); }
  function close(){ drawer.classList.remove("open"); scrim.classList.remove("open"); }

  brand.addEventListener("click", (e)=>{ e.preventDefault(); drawer.classList.contains("open") ? close() : open(); });
  scrim.addEventListener("click", close);
  document.addEventListener("keydown", (e)=>{ if(e.key === "Escape") close(); });
}

// ---- App sidebar (admin shell) ----
function initSidebar(){
  const btn = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("appSidebar");
  const main = document.getElementById("appMain");
  if(!btn || !sidebar || !main) return;

  btn.addEventListener("click", ()=>{
    if(window.innerWidth <= 760){
      sidebar.classList.toggle("open");
    } else {
      sidebar.classList.toggle("collapsed");
      main.classList.toggle("expanded");
    }
  });
}

// ---- Generic modal helpers ----
function openModal(id){
  const m = document.getElementById(id);
  if(m) m.classList.add("open");
}
function closeModal(id){
  const m = document.getElementById(id);
  if(m) m.classList.remove("open");
}

// ---- Toast ----
function showToast(message){
  let toast = document.getElementById("globalToast");
  if(!toast){
    toast = document.createElement("div");
    toast.id = "globalToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=> toast.classList.remove("show"), 2600);
}

// ---- Simple field validation helper for auth forms ----
function markFieldError(fieldEl, hasError){
  if(!fieldEl) return;
  fieldEl.classList.toggle("field-error", hasError);
}

document.addEventListener("DOMContentLoaded", ()=>{
  initDrawer();
  initSidebar();
});