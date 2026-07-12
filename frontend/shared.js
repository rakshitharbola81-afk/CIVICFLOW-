// CivicFlow shared utilities
const API_BASE = 'https://civicflow-api-d12q.onrender.com';

function getToken() { return localStorage.getItem('civicflow_token'); }
function getRole() { return localStorage.getItem('civicflow_role'); }
function getUser() { return localStorage.getItem('civicflow_user'); }

function requireAuth(allowedRoles) {
    const token = getToken();
    if (!token) { window.location.href = 'auth.html'; return false; }
    if (allowedRoles && !allowedRoles.includes(getRole())) {
        window.location.href = 'auth.html'; return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('civicflow_token');
    localStorage.removeItem('civicflow_role');
    localStorage.removeItem('civicflow_user');
    window.location.replace("auth.html");
}

async function apiFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };

    const token = getToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers["Content-Type"]
    ) {
        headers["Content-Type"] = "application/json";
    }

    let response;

    try {
        response = await fetch(API_BASE + path, {
            ...options,
            headers,
        });
    } catch (err) {
        throw new Error("Cannot connect to server.");
    }

    let data = {};

    try {
        data = await response.json();
    } catch (_) { }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Request failed."
        );
    }

    return data;
}

// Toast system
function toast(msg, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-6 right-6 z-[9999] space-y-2';
        document.body.appendChild(container);
    }
    const colors = {
        success: 'from-emerald-500 to-teal-500',
        error: 'from-rose-500 to-red-500',
        info: 'from-violet-500 to-blue-500',
    };
    const el = document.createElement('div');
    el.className = `px-5 py-3 rounded-xl text-white shadow-2xl bg-gradient-to-r ${colors[type] || colors.info} backdrop-blur-xl border border-white/20 animate-slide-in min-w-[240px] max-w-sm`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; }, 3200);
    setTimeout(() => el.remove(), 3600);
}

function spinner(size = 'w-5 h-5') {
    return `<svg class="animate-spin ${size} text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>`;
}

function statusBadge(status) {
    const map = {
        'Pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
        'Assigned': 'bg-blue-500/20 text-blue-300 border-blue-400/40',
        'In Progress': 'bg-orange-500/20 text-orange-300 border-orange-400/40',
        'Resolved': 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    };
    const cls = map[status] || 'bg-white/10 text-white/70 border-white/20';
    return `<span class="px-3 py-1 rounded-full text-xs font-semibold border ${cls}">${status || 'Unknown'}</span>`;
}

// Inject shared styles + font
(function injectShared() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = `
    :root { color-scheme: dark; }
    * { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
    body { background: #0f0f1a; color: #fff; }
    .glass-card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
    }
    .glass-strong {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.15);
    }
    .grad-text {
      background: linear-gradient(90deg,#a78bfa,#60a5fa,#22d3ee);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .grad-btn {
      background: linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4);
      background-size: 200% 100%;
      transition: background-position .4s ease, transform .2s ease, box-shadow .2s ease;
    }
    .grad-btn:hover { background-position: 100% 0; transform: translateY(-1px); box-shadow: 0 10px 30px -10px rgba(124,58,237,.6); }
    .tilt { transition: transform .3s ease; transform-style: preserve-3d; }
    .tilt:hover { transform: perspective(800px) rotateX(4deg) rotateY(-4deg) translateY(-4px); }
    .orb { position: absolute; border-radius: 9999px; filter: blur(80px); opacity: .5; pointer-events: none; }
    @keyframes slide-in { from { opacity:0; transform: translateX(20px);} to {opacity:1; transform:translateX(0);} }
    .animate-slide-in { animation: slide-in .3s ease-out; }
    @keyframes fade-up { from {opacity:0; transform:translateY(20px);} to {opacity:1; transform:translateY(0);} }
    .animate-fade-up { animation: fade-up .6s ease-out both; }
    @keyframes pop { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
    .animate-pop { animation: pop .3s ease-out both; }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    .animate-float { animation: float 6s ease-in-out infinite; }
    input, textarea, select {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      color: #fff; border-radius: 12px; padding: 12px 14px; width: 100%;
      transition: border-color .2s, box-shadow .2s;
    }
    input:focus, textarea:focus, select:focus {
      outline: none; border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124,58,237,.25);
    }
    select option { background: #1a1a2e; color: #fff; }
    input[type="file"] { padding: 8px; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
  `;
    document.head.appendChild(style);
})();
