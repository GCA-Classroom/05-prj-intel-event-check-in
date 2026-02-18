// Attendee list
let attendeeList = [];

// Load attendee list from localStorage
function loadAttendeeList() {
  const savedList = localStorage.getItem("attendeeList");
  if (savedList) {
    attendeeList = JSON.parse(savedList);
    renderAttendeeList();
  }
}

// Save attendee list to localStorage
function saveAttendeeList() {
  localStorage.setItem("attendeeList", JSON.stringify(attendeeList));
}

// Render attendee list
function renderAttendeeList() {
  const listEl = document.getElementById("attendeeList");
  if (!listEl) return;
  listEl.innerHTML = "";
  attendeeList.forEach(function (attendee) {
    const li = document.createElement("li");
    li.textContent = attendee.name;
    const teamSpan = document.createElement("span");
    teamSpan.textContent = attendee.teamLabel;
    teamSpan.className = `attendee-team ${attendee.team}`;
    li.appendChild(teamSpan);
    listEl.appendChild(li);
  });
}
// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

// Track attendance
let count = 0;
const maxCount = 50;

// Load counts from localStorage
function loadCounts() {
  const savedCount = localStorage.getItem("attendanceCount");
  if (savedCount !== null) {
    count = parseInt(savedCount);
    document.getElementById("attendeeCount").textContent = count;
    const percentage = Math.round((count / maxCount) * 100) + "%";
    document.getElementById("progressBar").style.width = percentage;
  }
  const teams = ["water", "zero", "power"];
  teams.forEach(function (team) {
    const savedTeam = localStorage.getItem(team + "Count");
    if (savedTeam !== null) {
      document.getElementById(team + "Count").textContent = savedTeam;
    }
  });
}

// Save counts to localStorage
function saveCounts() {
  localStorage.setItem("attendanceCount", count);
  localStorage.setItem(
    "waterCount",
    document.getElementById("waterCount").textContent,
  );
  localStorage.setItem(
    "zeroCount",
    document.getElementById("zeroCount").textContent,
  );
  localStorage.setItem(
    "powerCount",
    document.getElementById("powerCount").textContent,
  );
}

// Load counts on page load
window.addEventListener("DOMContentLoaded", loadCounts);
window.addEventListener("DOMContentLoaded", function () {
  loadAttendeeList();
});

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get form values
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.options[teamSelect.selectedIndex].text;

  // Increment count
  count++;

  // Update attendee count
  const attendeeCount = document.getElementById("attendeeCount");
  attendeeCount.textContent = count;

  // Update progress bar
  const percentage = Math.round((count / maxCount) * 100) + "%";
  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = percentage;

  // Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;

  // Add attendee to list
  attendeeList.push({
    name: name,
    team: team,
    teamLabel: teamName,
  });
  saveAttendeeList();
  renderAttendeeList();

  // Save counts to localStorage
  saveCounts();

  // Show welcome message
  const greeting = document.getElementById("greeting");
  greeting.textContent = `Welcome, ${name} from ${teamName}!`;
  greeting.classList.add("success-message");
  greeting.style.display = "block";

  // Celebration feature
  if (count === maxCount) {
    // Find the winning team
    const water = parseInt(document.getElementById("waterCount").textContent);
    const zero = parseInt(document.getElementById("zeroCount").textContent);
    const power = parseInt(document.getElementById("powerCount").textContent);
    let winner = "";
    if (water > zero && water > power) {
      winner = "Team Water Wise";
    } else if (zero > water && zero > power) {
      winner = "Team Net Zero";
    } else if (power > water && power > zero) {
      winner = "Team Renewables";
    } else {
      winner = "It's a tie!";
    }
    greeting.textContent = `🎉 Attendance goal reached! ${winner} has the most check-ins! 🎉`;
    greeting.classList.add("success-message");
    greeting.style.display = "block";
  }

  // Reset form
  form.reset();
});
