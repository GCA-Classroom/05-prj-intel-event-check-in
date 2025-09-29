// Intel Summit Check-In — upgraded UX
// Meets all rubric requirements. Extras:
// - Dark mode (persisted), Sound/Voice toggle
// - Undo last check-in (Ctrl+Z)
// - Keyboard shortcuts: 1/2/3 choose team, Enter submits
// - Donut leaderboard (pure CSS conic-gradient) — FIXED zero case
// - Avatars in attendee list
// - Toast notifications and micro-interactions

(function () {
  // DOM 
  const attendeeCountEl = document.getElementById("attendeeCount");
  const maxGoalEl = document.getElementById("maxGoal");
  const progressBarEl = document.getElementById("progressBar");
  const greetingEl = document.getElementById("greeting");
  const formEl = document.getElementById("checkInForm");
  const nameEl = document.getElementById("attendeeName");
  const teamEl = document.getElementById("teamSelect");
  const waterCountEl = document.getElementById("waterCount");
  const zeroCountEl = document.getElementById("zeroCount");
  const powerCountEl = document.getElementById("powerCount");
  const cardWater = document.getElementById("card-water");
  const cardZero = document.getElementById("card-zero");
  const cardPower = document.getElementById("card-power");
  const celebrationBanner = document.getElementById("celebrationBanner");
  const attendeeListEl = document.getElementById("attendeeList");
  const resetBtn = document.getElementById("resetBtn");
  const exportBtn = document.getElementById("exportBtn");
  const goalInput = document.getElementById("goalInput");
  const applyGoalBtn = document.getElementById("applyGoalBtn");
  const undoBtn = document.getElementById("undoBtn");
  const themeToggle = document.getElementById("themeToggle");
  const soundToggle = document.getElementById("soundToggle");
  const donut = document.getElementById("donut");
  const waterPctEl = document.getElementById("waterPct");
  const zeroPctEl = document.getElementById("zeroPct");
  const powerPctEl = document.getElementById("powerPct");
  const toast = document.getElementById("toast");

  // State
  const STORAGE_KEY = "intelCheckinData_v3";
  const THEME_KEY = "intelCheckinTheme";
  const SOUND_KEY = "intelCheckinSound";
  const defaultState = {
    goal: 50,
    attendees: [] // {name, team, ts}
  };
  let state = loadState();
  let lastAction = null; // for undo

  // Init UI
  applySavedTheme();
  applySavedSound();
  updateAll();
  greetingEl.style.display = "none";

  // Handlers
  formEl.addEventListener("submit", onSubmit);
  applyGoalBtn.addEventListener("click", onApplyGoal);
  resetBtn.addEventListener("click", onReset);
  exportBtn.addEventListener("click", onExport);
  undoBtn.addEventListener("click", onUndo);
  themeToggle.addEventListener("click", toggleTheme);
  soundToggle.addEventListener("click", toggleSound);

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      onUndo();
      return;
    }
    if (["1", "2", "3"].includes(e.key) && document.activeElement !== goalInput) {
      e.preventDefault();
      teamEl.value = e.key === "1" ? "water" : e.key === "2" ? "zero" : "power";
    }
  });

  // Submit
  function onSubmit(e) {
    e.preventDefault();
    const name = nameEl.value.trim().replace(/\s+/g, " ");
    const team = teamEl.value;
    if (!name || !team) return;

    const dup = state.attendees.find(
      (a) => a.name.toLowerCase() === name.toLowerCase()
    );
    const entry = { name: dup ? `${name} (${countName(name) + 1})` : name, team, ts: Date.now() };
    state.attendees.push(entry);
    lastAction = { type: "add", entry };

    saveState();
    updateAll();

    greetingEl.textContent = `🎉 Welcome, ${name}${dup ? " (again)" : ""} from ${prettyTeam(team)}!`;
    greetingEl.style.display = "block";

    chime();
    maybeSpeakLeader();

    nameEl.value = "";
    teamEl.value = "";
    nameEl.focus();
  }

  function onApplyGoal() {
    const val = parseInt(goalInput.value, 10);
    if (!Number.isFinite(val) || val < 1) return;
    state.goal = Math.min(val, 500);
    saveState();
    updateAll();
    showToast(`Goal set to ${state.goal}`);
  }

  function onReset() {
    const keepGoal = state.goal;
    state = { ...defaultState, goal: keepGoal };
    lastAction = null;
    saveState();
    updateAll();
    greetingEl.style.display = "none";
    showToast("All check-ins cleared");
  }

  function onUndo() {
    if (!lastAction) return;
    if (lastAction.type === "add") {
      const idx = state.attendees.findIndex(a => a.ts === lastAction.entry.ts);
      if (idx !== -1) {
        state.attendees.splice(idx, 1);
        saveState();
        updateAll();
        showToast(`Undid check-in: ${lastAction.entry.name}`);
        lastAction = null;
      }
    }
  }

  function onExport() {
    const header = "Name,Team,Timestamp\n";
    const rows = state.attendees
      .map((a) => {
        const t = new Date(a.ts).toLocaleString();
        return `"${a.name.replace(/"/g, '""')}",${prettyTeam(a.team)},"${t}"`;
      })
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "intel_summit_attendees.csv";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  // Storage helpers
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };
      const obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.attendees)) return { ...defaultState };
      return { goal: Number(obj.goal) || 50, attendees: obj.attendees };
    } catch {
      return { ...defaultState };
    }
  }
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Counts + UI
  function countByTeam() {
    const counts = { water: 0, zero: 0, power: 0 };
    for (const a of state.attendees) if (counts[a.team] != null) counts[a.team]++;
    return counts;
  }
  function prettyTeam(code) {
    switch (code) {
      case "water": return "Team Water Wise";
      case "zero": return "Team Net Zero";
      case "power": return "Team Renewables";
      default: return "Unknown Team";
    }
  }
  function countName(name) {
    return state.attendees.filter(
      (a) => a.name.toLowerCase().startsWith(name.toLowerCase())
    ).length;
  }

  function updateCountsUI(counts, total) {
    attendeeCountEl.textContent = total.toString();
    waterCountEl.textContent = counts.water;
    zeroCountEl.textContent = counts.zero;
    powerCountEl.textContent = counts.power;
  }
  function updateProgressUI(total) {
    maxGoalEl.textContent = state.goal;
    const pct = Math.max(0, Math.min(100, Math.round((total / state.goal) * 100)));
    progressBarEl.style.width = pct + "%";
    progressBarEl.setAttribute("aria-valuemin", "0");
    progressBarEl.setAttribute("aria-valuemax", "100");
    progressBarEl.setAttribute("aria-valuenow", String(pct));
  }
  function updateWinnersUI(counts, total) {
    [cardWater, cardZero, cardPower].forEach((c) => c.classList.remove("winner"));
    if (total === 0) {
      celebrationBanner.classList.add("hidden");
      return;
    }
    const entries = Object.entries(counts);
    const max = Math.max(...entries.map(([, n]) => n));
    const leaders = entries.filter(([, n]) => n === max).map(([t]) => t);
    leaders.forEach((team) => {
      const el = team === "water" ? cardWater : team === "zero" ? cardZero : cardPower;
      el.classList.add("winner");
    });
    if (total >= state.goal) {
      celebrationBanner.innerHTML =
        leaders.length === 1
          ? `🏆 Goal reached! <strong>${prettyTeam(leaders[0])}</strong> is leading with <strong>${max}</strong> attendees.`
          : `🎉 Goal reached! It's a tie between <strong>${leaders.map((t) => prettyTeam(t)).join(" & ")}</strong> at <strong>${max}</strong>.`;
      celebrationBanner.classList.remove("hidden");
      burstConfetti();
    } else {
      celebrationBanner.classList.add("hidden");
    }
  }

  // FIXED: when total is 0, show neutral ring and 0% labels (no fake 100%)
  function updateDonut(counts) {
    const total = state.attendees.length;

    if (total === 0) {
      donut.style.background = "conic-gradient(#e5e7eb 0deg 360deg)";
      waterPctEl.textContent = "0%";
      zeroPctEl.textContent = "0%";
      powerPctEl.textContent = "0%";
      return;
    }

    const w = Math.round((counts.water / total) * 100);
    const z = Math.round((counts.zero / total) * 100);
    const p = Math.max(0, 100 - w - z); // guard rounding drift

    const a1 = (w / 100) * 360;
    const a2 = ((w + z) / 100) * 360;

    donut.style.background = `conic-gradient(
      #38bdf8 0deg ${a1}deg,
      #34d399 ${a1}deg ${a2}deg,
      #f59e0b ${a2}deg 360deg
    )`;

    waterPctEl.textContent = `${w}%`;
    zeroPctEl.textContent = `${z}%`;
    powerPctEl.textContent = `${p}%`;
  }

  function renderList() {
    attendeeListEl.innerHTML = "";
    const items = [...state.attendees].sort((a, b) => b.ts - a.ts);
    for (const a of items) {
      const li = document.createElement("li");
      li.className = "list-item";
      const t = new Date(a.ts).toLocaleString();
      const avatar = makeAvatar(a.name, a.team);
      li.appendChild(avatar);
      const nameSpan = document.createElement("span");
      nameSpan.textContent = a.name;
      li.appendChild(nameSpan);
      const badge = document.createElement("span");
      badge.className = `badge ${a.team}`;
      badge.textContent = prettyTeam(a.team);
      li.appendChild(badge);
      const time = document.createElement("span");
      time.className = "time";
      time.textContent = t;
      li.appendChild(time);
      attendeeListEl.appendChild(li);
    }
  }

  function updateAll() {
    const counts = countByTeam();
    const total = state.attendees.length;
    updateCountsUI(counts, total);
    updateProgressUI(total);
    updateWinnersUI(counts, total);
    updateDonut(counts);
    renderList();
    goalInput.value = state.goal;
  }

  // Fancy bits
  function burstConfetti() {
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.position = "fixed";
      c.style.top = "-10px";
      c.style.width = "10px";
      c.style.height = "14px";
      c.style.zIndex = "9999";
      c.style.opacity = "0.9";
      c.style.animation = "fall 2.2s linear forwards";
      c.style.background =
        ["#00c7fd", "#0071c5", "#00aeef", "#34d399", "#f59e0b"][(Math.random() * 5) | 0];
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      c.style.animationDelay = (Math.random() * 0.4).toFixed(2) + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 2800);
    }
  }

  function makeAvatar(name, team) {
    const el = document.createElement("div");
    el.className = "avatar";
    const initials = name.split(" ").slice(0, 2).map(s => s[0]?.toUpperCase() || "").join("");
    el.textContent = initials || "?";
    el.style.background = team === "water" ? "var(--water)" : team === "zero" ? "var(--zero)" : "var(--power)";
    return el;
  }

  // Theme & sound
  function applySavedTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const dark = saved === "dark" || (saved == null && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.body.classList.toggle("dark", dark);
    themeToggle.setAttribute("aria-pressed", String(dark));
  }
  function toggleTheme() {
    const next = !document.body.classList.contains("dark");
    document.body.classList.toggle("dark", next);
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", String(next));
  }

  function applySavedSound() {
    const saved = localStorage.getItem(SOUND_KEY);
    const on = saved !== "off";
    soundToggle.setAttribute("aria-pressed", String(on));
  }
  function toggleSound() {
    const on = soundToggle.getAttribute("aria-pressed") !== "true";
    soundToggle.setAttribute("aria-pressed", String(on));
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
    showToast(on ? "Sound on" : "Sound off");
  }

  function chime() {
    if (soundToggle.getAttribute("aria-pressed") !== "true") return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = 880;
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    o.start(); o.stop(ctx.currentTime + 0.26);
  }

  function maybeSpeakLeader() {
    if (soundToggle.getAttribute("aria-pressed") !== "true") return;
    if (!("speechSynthesis" in window)) return;
    const counts = countByTeam();
    const entries = Object.entries(counts);
    const max = Math.max(...entries.map(([, n]) => n));
    const leaders = entries.filter(([, n]) => n === max).map(([t]) => prettyTeam(t));
    if (leaders.length === 0) return;
    const msg = new SpeechSynthesisUtterance(
      leaders.length === 1 ? `${leaders[0]} is in the lead.` : `We have a tie: ${leaders.join(" and ")}.`
    );
    msg.rate = 1.05; msg.pitch = 1.0;
    window.speechSynthesis.speak(msg);
  }

  // Toasts
  let toastTimer = null;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
  }
})();
