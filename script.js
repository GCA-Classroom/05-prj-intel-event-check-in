const form = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const waterCount = document.getElementById("waterCount");
const zeroCount = document.getElementById("zeroCount");
const powerCount = document.getElementById("powerCount");
const attendeeList = document.getElementById("attendeeList");

let totalAttendees = 0;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
let attendeeEntries = [];
const maxAttendees = 50;
const storageKey = "intel-summit-attendance";

function getTeamName(team) {
  if (team === "water") {
    return "Team Water Wise";
  }

  if (team === "zero") {
    return "Team Net Zero";
  }

  if (team === "power") {
    return "Team Renewables";
  }

  return "Unassigned";
}

function getWinningTeam() {
  let winningTeam = "water";

  if (teamCounts.zero > teamCounts[winningTeam]) {
    winningTeam = "zero";
  }

  if (teamCounts.power > teamCounts[winningTeam]) {
    winningTeam = "power";
  }

  return winningTeam;
}

function saveAttendanceData() {
  const dataToSave = {
    totalAttendees: totalAttendees,
    teamCounts: teamCounts,
    attendeeEntries: attendeeEntries,
  };

  localStorage.setItem(storageKey, JSON.stringify(dataToSave));
}

function loadAttendanceData() {
  const savedData = localStorage.getItem(storageKey);

  if (savedData) {
    const parsedData = JSON.parse(savedData);
    totalAttendees = parsedData.totalAttendees || 0;
    teamCounts = parsedData.teamCounts || {
      water: 0,
      zero: 0,
      power: 0,
    };
    attendeeEntries = parsedData.attendeeEntries || [];
  }
}

function renderAttendance() {
  attendeeCount.textContent = totalAttendees;
  waterCount.textContent = teamCounts.water;
  zeroCount.textContent = teamCounts.zero;
  powerCount.textContent = teamCounts.power;

  const progress = (totalAttendees / maxAttendees) * 100;
  progressBar.style.width = `${progress}%`;

  attendeeList.innerHTML = "";

  if (attendeeEntries.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "No attendees checked in yet.";
    attendeeList.appendChild(emptyItem);
    return;
  }

  attendeeEntries.forEach(function (entry) {
    const listItem = document.createElement("li");
    listItem.className = "attendee-item";
    listItem.innerHTML = `<span class="attendee-name">${entry.name}</span><span class="attendee-team">${getTeamName(entry.team)}</span>`;
    attendeeList.appendChild(listItem);
  });
}

function updateAttendanceCount(attendeeName, team) {
  totalAttendees = totalAttendees + 1;
  teamCounts[team] = teamCounts[team] + 1;
  attendeeEntries.push({
    name: attendeeName,
    team: team,
  });

  renderAttendance();
  saveAttendanceData();
}

loadAttendanceData();
renderAttendance();

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const attendeeName = attendeeNameInput.value.trim();

  greeting.style.display = "block";
  greeting.className = "success-message";

  if (attendeeName === "") {
    greeting.textContent = "Please enter your name before checking in.";
    greeting.className = "";
    return;
  }

  if (teamSelect.value === "") {
    greeting.textContent = "Please choose a team before checking in.";
    greeting.className = "";
    return;
  }

  updateAttendanceCount(attendeeName, teamSelect.value);

  if (totalAttendees === maxAttendees) {
    const winningTeam = getWinningTeam();
    greeting.textContent = `🎉 Goal reached! ${getTeamName(winningTeam)} is the winning team!`;
    greeting.className = "celebration-message";
  } else {
    greeting.textContent = `Welcome, ${attendeeName}! You are checked in and ready to join the summit.`;
  }

  attendeeNameInput.value = "";
  teamSelect.value = "";
});
