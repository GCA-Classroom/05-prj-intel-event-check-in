const MAX_GOAL = 50;
const STORAGE_KEY = "intelSummitCheckIn";
const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

let attendeeCount = 0;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
let attendees = [];

const form = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCountElement = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const teamStats = document.querySelector(".team-stats");

const celebration = document.createElement("p");
celebration.setAttribute("aria-live", "polite");
celebration.style.display = "none";
celebration.style.padding = "16px 20px";
celebration.style.borderRadius = "8px";
celebration.style.backgroundColor = "#ecfdf3";
celebration.style.color = "#166534";
greeting.insertAdjacentElement("afterend", celebration);

const storageMessage = document.createElement("p");
storageMessage.setAttribute("role", "status");
storageMessage.style.color = "#b42318";
storageMessage.style.display = "none";
form.insertAdjacentElement("afterend", storageMessage);

const attendeeListSection = document.createElement("section");
attendeeListSection.setAttribute("aria-labelledby", "attendeeListHeading");
attendeeListSection.style.marginTop = "30px";
attendeeListSection.style.paddingTop = "20px";
attendeeListSection.style.borderTop = "2px solid #f1f5f9";

const attendeeListHeading = document.createElement("h3");
attendeeListHeading.id = "attendeeListHeading";
attendeeListHeading.textContent = "Checked-In Attendees";
attendeeListHeading.style.color = "#64748b";
attendeeListHeading.style.fontSize = "16px";

const attendeeList = document.createElement("ul");
attendeeList.style.listStyle = "none";
attendeeList.style.padding = "0";

attendeeListSection.appendChild(attendeeListHeading);
attendeeListSection.appendChild(attendeeList);
teamStats.appendChild(attendeeListSection);

function showStorageMessage(message) {
  storageMessage.textContent = message;
  storageMessage.style.display = "block";
}

function isTeam(teamKey) {
  return Object.prototype.hasOwnProperty.call(teamNames, teamKey);
}

function isValidSavedState(savedState) {
  if (
    !savedState ||
    !Number.isInteger(savedState.attendeeCount) ||
    savedState.attendeeCount < 0 ||
    !savedState.teamCounts ||
    !Array.isArray(savedState.attendees) ||
    savedState.attendeeCount !== savedState.attendees.length
  ) {
    return false;
  }

  let teamTotal = 0;
  const teamKeys = Object.keys(teamNames);

  for (let i = 0; i < teamKeys.length; i = i + 1) {
    const teamKey = teamKeys[i];
    const count = savedState.teamCounts[teamKey];

    if (!Number.isInteger(count) || count < 0) {
      return false;
    }

    teamTotal = teamTotal + count;
  }

  if (teamTotal !== savedState.attendeeCount) {
    return false;
  }

  for (let i = 0; i < savedState.attendees.length; i = i + 1) {
    const attendee = savedState.attendees[i];

    if (
      !attendee ||
      typeof attendee.name !== "string" ||
      !attendee.name.trim() ||
      !isTeam(attendee.team)
    ) {
      return false;
    }
  }

  return true;
}

function loadSavedState() {
  let savedValue;

  try {
    savedValue = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Could not read check-in data from local storage.", error);
    showStorageMessage("Saved check-in data could not be accessed in this browser.");
    return;
  }

  if (!savedValue) {
    return;
  }

  try {
    const savedState = JSON.parse(savedValue);

    if (!isValidSavedState(savedState)) {
      showStorageMessage("Saved check-in data is invalid, so the counters have been reset.");
      return;
    }

    attendeeCount = savedState.attendeeCount;
    teamCounts = savedState.teamCounts;
    attendees = savedState.attendees;
  } catch (error) {
    console.error("Could not restore check-in data from local storage.", error);
    showStorageMessage("Saved check-in data could not be read, so the counters have been reset.");
  }
}

function saveState() {
  const savedState = {
    attendeeCount: attendeeCount,
    teamCounts: teamCounts,
    attendees: attendees,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    storageMessage.style.display = "none";
  } catch (error) {
    console.error("Could not save check-in data to local storage.", error);
    showStorageMessage("This check-in was counted, but could not be saved in this browser.");
  }
}

function updateProgress() {
  const progressPercent = (attendeeCount / MAX_GOAL) * 100;
  const cappedProgress = Math.min(progressPercent, 100);

  attendeeCountElement.textContent = attendeeCount;
  progressBar.style.width = `${cappedProgress}%`;
  progressBar.setAttribute("role", "progressbar");
  progressBar.setAttribute("aria-label", "Attendance goal progress");
  progressBar.setAttribute("aria-valuemin", "0");
  progressBar.setAttribute("aria-valuemax", MAX_GOAL);
  progressBar.setAttribute("aria-valuenow", Math.min(attendeeCount, MAX_GOAL));
}

function updateTeamCounts() {
  const teamKeys = Object.keys(teamNames);

  for (let i = 0; i < teamKeys.length; i = i + 1) {
    const teamKey = teamKeys[i];
    const teamCountElement = document.getElementById(`${teamKey}Count`);
    teamCountElement.textContent = teamCounts[teamKey];
  }
}

function updateAttendeeList() {
  attendeeList.textContent = "";

  for (let i = 0; i < attendees.length; i = i + 1) {
    const attendee = attendees[i];
    const listItem = document.createElement("li");
    listItem.textContent = `${attendee.name} - ${teamNames[attendee.team]}`;
    listItem.style.padding = "10px 12px";
    listItem.style.marginBottom = "8px";
    listItem.style.borderRadius = "8px";
    listItem.style.backgroundColor = "#f8fafc";
    attendeeList.appendChild(listItem);
  }
}

function updateCelebration() {
  if (attendeeCount < MAX_GOAL) {
    celebration.style.display = "none";
    return;
  }

  let highestTeamCount = -1;
  let winningTeams = [];
  const teamKeys = Object.keys(teamNames);

  for (let i = 0; i < teamKeys.length; i = i + 1) {
    const teamKey = teamKeys[i];

    if (teamCounts[teamKey] > highestTeamCount) {
      highestTeamCount = teamCounts[teamKey];
      winningTeams = [teamNames[teamKey]];
    } else if (teamCounts[teamKey] === highestTeamCount) {
      winningTeams.push(teamNames[teamKey]);
    }
  }

  if (winningTeams.length === 1) {
    celebration.textContent = `Goal reached! Congratulations to ${winningTeams[0]} for leading attendance!`;
  } else {
    celebration.textContent = `Goal reached! ${winningTeams.join(" and ")} are tied for the highest turnout!`;
  }

  celebration.style.display = "block";
}

function updatePage() {
  updateProgress();
  updateTeamCounts();
  updateAttendeeList();
  updateCelebration();
}

loadSavedState();
updatePage();

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const attendeeName = attendeeNameInput.value.trim();
  const selectedTeam = teamSelect.value;

  if (!attendeeName || !isTeam(selectedTeam)) {
    return;
  }

  attendeeCount = attendeeCount + 1;
  teamCounts[selectedTeam] = teamCounts[selectedTeam] + 1;
  attendees.push({
    name: attendeeName,
    team: selectedTeam,
  });

  greeting.textContent = `Welcome ${attendeeName}! You're checked in for ${teamNames[selectedTeam]}.`;
  greeting.classList.add("success-message");
  greeting.style.display = "block";

  updatePage();
  saveState();
  form.reset();
});
