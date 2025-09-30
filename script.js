// Get all needed DOM elements
const form = document.getElementById('checkInForm');
const nameInput = document.getElementById('attendeeName');
const teamSelect = document.getElementById('teamSelect');

// Track attendance
let count = 0;
const maxCount = 50; // Maximum number of attendees

// LocalStorage keys
const LS = {
  total: 'att_total',
  water: 'att_water',
  zero:  'att_zero',
  power: 'att_power',
  list:  'att_list' // JSON: [{name, team, teamName}]
};

// Restore from storage on load
(function restoreFromStorage() {
  count = Number(localStorage.getItem(LS.total)) || 0;
  document.getElementById('attendeeCount').textContent = count;

  document.getElementById('waterCount').textContent =
    Number(localStorage.getItem(LS.water)) || 0;
  document.getElementById('zeroCount').textContent  =
    Number(localStorage.getItem(LS.zero))  || 0;
  document.getElementById('powerCount').textContent =
    Number(localStorage.getItem(LS.power)) || 0;

  const percentage = Math.round((count / maxCount) * 100) + "%";
  document.getElementById('progressBar').style.width = percentage;

  renderList();

  if (count >= maxCount) showCelebration();

  console.log("[Restore] total:", count);
})();

// Helpers for attendee list
function getPeople() {
  try { return JSON.parse(localStorage.getItem(LS.list)) || []; }
  catch { return []; }
}
function renderList() {
  const listEl = document.getElementById('attendeeList');
  if (!listEl) return;
  const people = getPeople();
  listEl.innerHTML = '';
  people.forEach(({ name, teamName }) => {
    const li = document.createElement('li');
    li.textContent = `${name} — ${teamName}`;
    listEl.appendChild(li);
  });
  console.log("[RenderList] attendees:", people);
}

function saveCounts() {
  localStorage.setItem(LS.total, String(count));
  localStorage.setItem(LS.water, document.getElementById('waterCount').textContent);
  localStorage.setItem(LS.zero,  document.getElementById('zeroCount').textContent);
  localStorage.setItem(LS.power, document.getElementById('powerCount').textContent);
  console.log("[Save] total:", count);
}

function showCelebration() {
  const celebration = document.getElementById('celebration');
  if (!celebration) return;

  const water = Number(document.getElementById('waterCount').textContent) || 0;
  const zero  = Number(document.getElementById('zeroCount').textContent)  || 0;
  const power = Number(document.getElementById('powerCount').textContent) || 0;

  const ranking = [
    { name: 'Team Water Wise', count: water },
    { name: 'Team Net Zero',   count: zero  },
    { name: 'Team Renewables', count: power },
  ].sort((a, b) => b.count - a.count);

  const top = ranking[0];
  const tied = ranking.filter(t => t.count === top.count);

  celebration.textContent = tied.length > 1
    ? `🏆 Goal reached! It’s a tie: ${tied.map(t => t.name).join(' & ')}`
    : `🏆 Goal reached! Congrats to ${top.name}!`;

  celebration.classList.add('show');
  console.log("[Celebration]", celebration.textContent);
}

// Handle form submission
form.addEventListener('submit', function(event) {
  event.preventDefault();

  // Get form values
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  console.log("[Submit] name:", name, "| team:", team, "| teamName:", teamName);

  // increment Count
  count++;
  console.log("Total check-ins:", count);

  // Update progress bar
  const percentage = Math.round((count / maxCount) * 100) + "%";
  document.getElementById('progressBar').style.width = percentage;
  document.getElementById('attendeeCount').textContent = count;
  console.log("Progress:", percentage);

  // Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;
  console.log("Updated", teamName, "count:", teamCounter.textContent);

  // Show welcome message
  const message = `🎉 Welcome, ${name} from ${teamName}!`;
  const greeting = document.getElementById('greeting');
  greeting.textContent = message;
  greeting.classList.add('show');
  console.log("[Greeting]", message);

  // Save counts
  saveCounts();

  // Save attendee list
  const people = getPeople();
  people.push({ name, team, teamName });
  localStorage.setItem(LS.list, JSON.stringify(people));
  renderList();

  // Check goal
  if (count >= maxCount) showCelebration();

  // Clear greeting after 3s
  clearTimeout(window._greetTimer);
  window._greetTimer = setTimeout(() => {
    greeting.classList.remove('show');
    setTimeout(() => {
      greeting.textContent = '';
    }, 500);
  }, 3000);

  form.reset();
});
