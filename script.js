// Safe DOM access helpers
function $(id) {
  return document.getElementById(id);
}

// Required elements
const form = $("checkInForm");
const nameInput = $("attendeeName");
const teamSelect = $("teamSelect");
const greeting = $("greeting");
const progressBar = $("progressBar");
const attendeeCountEl = $("attendeeCount");
const resetBtn = $("resetAttendanceBtn");

// Set initial attendance tracking and persistence
let count = 0;
const maxCount = 100;

const teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};

// Load persisted state from localStorage (if available)
function loadState() {
  try {
    const raw = localStorage.getItem("attendanceState");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed.count === "number") count = parsed.count;
    if (parsed.teamCounts && typeof parsed.teamCounts === "object") {
      teamCounts.water = parsed.teamCounts.water || 0;
      teamCounts.zero = parsed.teamCounts.zero || 0;
      teamCounts.power = parsed.teamCounts.power || 0;
    }
  } catch (e) {
    console.warn("Could not load attendance state:", e);
  }
}

function saveState() {
  try {
    const toSave = { count, teamCounts };
    localStorage.setItem("attendanceState", JSON.stringify(toSave));
  } catch (e) {
    console.warn("Could not save attendance state:", e);
  }
}

function updateUI() {
  if (attendeeCountEl) attendeeCountEl.textContent = count;
  if (progressBar) {
    const percent = Math.round((count / maxCount) * 100);
    progressBar.style.width = Math.min(percent, 100) + "%";
    progressBar.setAttribute("aria-valuenow", Math.min(percent, 100));
  }
  const water = $("waterCount");
  const zero = $("zeroCount");
  const power = $("powerCount");
  if (water) water.textContent = teamCounts.water;
  if (zero) zero.textContent = teamCounts.zero;
  if (power) power.textContent = teamCounts.power;
}

function showGreeting(message, success) {
  if (!greeting) return;
  greeting.textContent = message;
  greeting.classList.toggle("success-message", !!success);
  greeting.style.display = message ? "block" : "none";
}

function resetAttendance(confirmReset) {
  if (confirmReset && !confirm("Reset all attendance counts?")) return;
  count = 0;
  teamCounts.water = 0;
  teamCounts.zero = 0;
  teamCounts.power = 0;
  saveState();
  updateUI();
  showGreeting("Attendance reset.", true);
}

// Initialize
loadState();
updateUI();

// Attach handlers only when form exists
if (form && nameInput && teamSelect) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = (nameInput.value || "").trim();
    const team = teamSelect.value || "";
    const selectedOpt = teamSelect.selectedOptions
      ? teamSelect.selectedOptions[0]
      : null;
    const teamName = selectedOpt ? selectedOpt.text : team;

    if (!name || !team) {
      alert("Please enter your name and select a team.");
      return;
    }

    // Increment attendance
    count = Math.min(count + 1, maxCount);
    if (teamCounts.hasOwnProperty(team)) teamCounts[team]++;

    updateUI();
    saveState();

    // Show greeting
    showGreeting(`Welcome, ${name} from ${teamName}!`, true);

    // Reset form
    form.reset();
  });
} else {
  console.warn(
    "Check-in form or required inputs are missing. Script will run in degraded mode."
  );
}

// Reset button
if (resetBtn) {
  resetBtn.addEventListener("click", function () {
    resetAttendance(true);
  });
}
