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

// ---- Welcome chip (admin shell): greet the signed-in admin by name ----
function initWelcomeChip(){
  const chip = document.querySelector(".welcome-chip");
  if(!chip || typeof Session === "undefined") return;
  const user = Session.user;
  if(!user || !user.first_name) return;
  chip.innerHTML = "";
  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.textContent = "\u{1F464}";
  chip.append(avatar, ` Welcome, ${user.first_name}`);
}

// Going "back" after logging out can show a cached copy of a page, scripts
// and all, so the guards never re-run and it looks like logout did nothing.
// Reloading on a restored page sends the visitor to the login page instead.
window.addEventListener("pageshow", (e)=>{
  if(e.persisted) window.location.reload();
});

document.addEventListener("DOMContentLoaded", ()=>{
  initDrawer();
  initSidebar();
  initWelcomeChip();
});

// ---- Conversation thread (request and feedback detail pages) ----
// A request is a conversation, not a single question and a single answer.
// The first message is what the user wrote; every reply from either side is
// another row. Without this, a follow-up from the user is in the database but
// invisible to staff, which is exactly the bug this replaced.
//
//   renderThread(container, item, messages)
//
// `item` is the request or feedback object, `messages` the rows from
// Requests.messages() / Feedback.messages(). If the server hasn't been
// updated yet it may send only item.body and item.reply; both shapes render.
function renderThread(container, item, messages){
  if(!container) return;

  let rows = Array.isArray(messages) ? messages.slice() : [];

  // Fall back to the old single-reply shape so the page still works against
  // a backend that hasn't added support_messages yet.
  if(!rows.length){
    rows.push({
      sender_role: "user",
      sender_name: item.user_name,
      body: item.body,
      created_at: item.created_at,
    });
    if(item.reply){
      rows.push({
        sender_role: "staff",
        sender_name: item.handled_by_name,
        body: item.reply,
        created_at: item.replied_at,
      });
    }
  }

  rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  container.innerHTML = rows.map((m) => {
    // Anything that isn't the user is staff: the column may say
    // account_administrator, platform_administrator, admin or staff.
    const fromUser = m.sender_role === "user";
    const who = m.sender_name || (fromUser ? (item.user_name || "User") : "Support");
    const attachments = (m.attachments || [])
      .map((name) => `<span class="attachment-chip">\u{1F4CE} ${escapeHtml(name)}</span>`)
      .join("");

    return `<div class="msg ${fromUser ? "msg-user" : "msg-staff"}">
      <div class="msg-meta">
        <span class="msg-who">${escapeHtml(who)}</span>
        <span class="msg-when">${escapeHtml(formatDateTime(m.created_at))}</span>
      </div>
      <div class="msg-body">${escapeHtml(m.body || "")}</div>
      ${attachments ? `<div class="msg-files">${attachments}</div>` : ""}
    </div>`;
  }).join("");

  // A long thread is most useful at the newest end.
  container.scrollTop = container.scrollHeight;
}

/** True when the last message came from the user, i.e. staff owe a reply. */
function awaitingReply(messages){
  if(!Array.isArray(messages) || !messages.length) return false;
  const last = messages[messages.length - 1];
  return last.sender_role === "user";
}

// ---- Logout ----
// Binds every logout control on the page: the hover button in the top bar
// (.logout-btn) and any other button marked data-action="logout", such as the
// one on My Account. Using getElementById here would only find the first one.
function initLogout(){
  document.querySelectorAll('.logout-btn, [data-action="logout"]').forEach((btn)=>{
    btn.addEventListener("click", (e)=>{
      e.preventDefault();
      if(!confirm("Are you sure you want to log out?")) return;
      // Clear the stored token, or the next visit walks straight back in.
      if(typeof Auth !== "undefined") Auth.logout();
      window.location.href = "../login.html";
    });
  });
}
initLogout();