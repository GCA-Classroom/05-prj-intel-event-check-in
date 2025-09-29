// ----- From HTML -----
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const checkInBtn = document.getElementById("checkInBtn");

// Counters
const teamEls = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"),
  power: document.getElementById("powerCount"),
};
const attendeeCountEl = document.getElementById("attendeeCount");

// ----- STEP 2: Track of # -----
let count = 0;                
const maxCount = 50;          
let hasCelebrated = false;    

const teams = { water: 0, zero: 0, power: 0 };

// ----- Load Data -----
try {
  const saved = JSON.parse(localStorage.getItem("intelCounts") || "null");
  if (saved) {
    count = typeof saved.count === "number" ? saved.count : 0;
    if (saved.teams) Object.assign(teams, saved.teams);
    hasCelebrated = !!saved.hasCelebrated;
  }
} catch {}

// ----- Update -----
function updateUI() {
  attendeeCountEl.textContent = count;

  const pct = Math.min((count / maxCount) * 100, 100);
  progressBar.style.width = pct + "%";

  teamEls.water.textContent = teams.water;
  teamEls.zero.textContent = teams.zero;
  teamEls.power.textContent = teams.power;

  // Disable Button
  const full = count >= maxCount;
  checkInBtn.disabled = full;
  checkInBtn.style.opacity = full ? "0.6" : "1";
  checkInBtn.style.cursor = full ? "not-allowed" : "pointer";

  // Save
  localStorage.setItem("intelCounts", JSON.stringify({ count, teams, hasCelebrated }));
}

// ----- Winner Helpers -----
const TEAM_LABEL = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};
function topTeams(obj) {
  const max = Math.max(obj.water, obj.zero, obj.power);
  return Object.keys(obj).filter(k => obj[k] === max);
}

// ----- Celebration -----
function maybeCelebrate() {
  if (hasCelebrated) return;
  if (count < maxCount) return;

  const winners = topTeams(teams);
  const label = winners.length === 1
    ? TEAM_LABEL[winners[0]]
    : winners.map(k => TEAM_LABEL[k]).join(" & ");

  // Replace welcome message with celebration
  greeting.textContent = `🎉 Goal reached! Winner: ${label}`;
  greeting.style.display = "block";

  hasCelebrated = true;
  localStorage.setItem("intelCounts", JSON.stringify({ count, teams, hasCelebrated }));
}

// ----- Attendee list -----
const attendeeList = document.getElementById("attendeeList") || (() => {
  const ul = document.createElement("ul");
  ul.id = "attendeeList";
  ul.style.marginTop = "12px";
  const host = document.querySelector(".team-stats") || document.body; // fallback
  host.appendChild(ul);
  return ul;
})();
function addAttendee(name, teamName) {
  const li = document.createElement("li");
  li.textContent = `${name} — ${teamName}`;
  attendeeList.appendChild(li);
}

// ----- Form submit -----
form.addEventListener("submit", function(e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;

  if (!name) {
    greeting.textContent = "Please enter a name.";
    greeting.style.display = "block";
    return;
  }
  if (!team) {
    greeting.textContent = "Please select a team.";
    greeting.style.display = "block";
    return;
  }
  if (count >= maxCount) {
    greeting.textContent = "Capacity reached (50).";
    greeting.style.display = "block";
    return;
  }

  // Safe after validation
  const teamName = teamSelect.selectedOptions[0]?.text || TEAM_LABEL[team] || "Selected Team";

  // Totals
  count++;
  teams[team]++;

  // Screen
  updateUI();

  // Greetings
  greeting.textContent = `Welcome, ${name} from ${teamName}`;
  greeting.style.display = "block";

  // Add to list + maybe celebrate
  addAttendee(name, teamName);
  maybeCelebrate();

  form.reset();
});

// ----- STEP 9: Kick things off -----
updateUI();
maybeCelebrate(); // also check on page load
