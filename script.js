const MAX_ATTENDEES = 50;

const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const celebrationMessage = document.getElementById("celebrationMessage");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");

const STORAGE_KEY = "intel-summit-check-in-state";

const teamCountElements = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"),
  power: document.getElementById("powerCount"),
};

const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

let totalCheckIns = 0;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
let attendeeEntries = [];

function renderAttendeeList() {
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
    listItem.className = "attendee-list-item";

    const attendeeName = document.createElement("span");
    attendeeName.className = "attendee-name";
    attendeeName.textContent = entry.name;

    const attendeeTeam = document.createElement("span");
    attendeeTeam.className = "attendee-team";
    attendeeTeam.textContent = teamNames[entry.team];

    listItem.appendChild(attendeeName);
    listItem.appendChild(attendeeTeam);
    attendeeList.appendChild(listItem);
  });
}

function updateAttendanceUI() {
  attendeeCount.textContent = totalCheckIns;
  progressBar.style.width = `${(totalCheckIns / MAX_ATTENDEES) * 100}%`;

  teamCountElements.water.textContent = teamCounts.water;
  teamCountElements.zero.textContent = teamCounts.zero;
  teamCountElements.power.textContent = teamCounts.power;

  renderAttendeeList();
}

function saveProgress() {
  const savedData = {
    totalCheckIns: totalCheckIns,
    teamCounts: teamCounts,
    attendeeEntries: attendeeEntries,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
}

function loadProgress() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return;
  }

  try {
    const parsedData = JSON.parse(savedData);

    if (typeof parsedData.totalCheckIns === "number") {
      totalCheckIns = parsedData.totalCheckIns;
    }

    if (parsedData.teamCounts) {
      teamCounts = {
        water: parsedData.teamCounts.water || 0,
        zero: parsedData.teamCounts.zero || 0,
        power: parsedData.teamCounts.power || 0,
      };
    }

    if (Array.isArray(parsedData.attendeeEntries)) {
      attendeeEntries = parsedData.attendeeEntries.filter(function (entry) {
        const isValidTeam = Object.prototype.hasOwnProperty.call(
          teamNames,
          entry.team,
        );
        const isValidName =
          typeof entry.name === "string" && entry.name.trim() !== "";
        return isValidTeam && isValidName;
      });
    }
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function getWinningTeamName() {
  let winningTeamKey = "water";

  if (teamCounts.zero > teamCounts[winningTeamKey]) {
    winningTeamKey = "zero";
  }

  if (teamCounts.power > teamCounts[winningTeamKey]) {
    winningTeamKey = "power";
  }

  return teamNames[winningTeamKey];
}

function updateCelebrationMessage() {
  if (totalCheckIns >= MAX_ATTENDEES) {
    const winningTeamName = getWinningTeamName();
    celebrationMessage.textContent = `Goal reached! ${winningTeamName} wins the attendance challenge.`;
    celebrationMessage.style.display = "block";
  } else {
    celebrationMessage.style.display = "none";
  }
}

loadProgress();
updateAttendanceUI();
updateCelebrationMessage();

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const attendeeName = attendeeNameInput.value.trim();
  const selectedTeam = teamSelect.value;

  if (attendeeName === "" || selectedTeam === "") {
    return;
  }

  if (totalCheckIns >= MAX_ATTENDEES) {
    greeting.textContent = "Check-in is full. We have reached 50 attendees.";
    greeting.classList.add("success-message");
    greeting.style.display = "block";
    return;
  }

  totalCheckIns = totalCheckIns + 1;
  teamCounts[selectedTeam] = teamCounts[selectedTeam] + 1;
  attendeeEntries.push({
    name: attendeeName,
    team: selectedTeam,
  });

  greeting.textContent = `Welcome, ${attendeeName}! You are checked in with ${teamNames[selectedTeam]}.`;
  greeting.classList.add("success-message");
  greeting.style.display = "block";

  updateAttendanceUI();
  updateCelebrationMessage();
  saveProgress();

  checkInForm.reset();
  attendeeNameInput.focus();
});
