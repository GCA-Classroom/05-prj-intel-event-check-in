const checkInForm = document.querySelector("#checkInForm");
const attendeeNameInput = document.querySelector("#attendeeName");
const teamSelect = document.querySelector("#teamSelect");
const attendeeCount = document.querySelector("#attendeeCount");
const attendeeGoal = document.querySelector("#attendeeGoal");
const progressBar = document.querySelector("#progressBar");
const attendanceProgress = document.querySelector("#attendanceProgress");
const goalCelebration = document.querySelector("#goalCelebration");
const goalCelebrationText = document.querySelector("#goalCelebrationText");
const greeting = document.querySelector("#greeting");
const attendeeList = document.querySelector("#attendeeList");
const emptyRoster = document.querySelector("#emptyRoster");
const clearAttendeesBtn = document.querySelector("#clearAttendeesBtn");
const maxAttendees = 50;
const storageKey = "intelSummitAttendees";
const teamCards = [
  {
    key: "water",
    name: "Team Water Wise",
    countElement: document.querySelector("#waterCount"),
    cardElement: document.querySelector("#waterTeamCard"),
    count: 0,
  },
  {
    key: "zero",
    name: "Team Net Zero",
    countElement: document.querySelector("#zeroCount"),
    cardElement: document.querySelector("#zeroTeamCard"),
    count: 0,
  },
  {
    key: "power",
    name: "Team Renewables",
    countElement: document.querySelector("#powerCount"),
    cardElement: document.querySelector("#powerTeamCard"),
    count: 0,
  },
];
let attendees = [];

try {
  attendees = JSON.parse(localStorage.getItem(storageKey)) || [];
} catch (error) {
  attendees = [];
}

function saveAttendees() {
  localStorage.setItem(storageKey, JSON.stringify(attendees));
}

function animateTeamEmoji(team) {
  const teamEmoji = document.querySelector(`#${team}TeamEmoji`);

  teamEmoji.classList.remove("team-emoji-pop");
  void teamEmoji.offsetWidth;
  teamEmoji.classList.add("team-emoji-pop");
}

function updateAttendance() {
  const totalAttendees = attendees.length;
  const progress = Math.min((totalAttendees / maxAttendees) * 100, 100);

  attendeeCount.textContent = totalAttendees;
  attendeeGoal.textContent = maxAttendees;
  progressBar.style.width = `${progress}%`;
  attendanceProgress.setAttribute("aria-valuemax", maxAttendees);
  attendanceProgress.setAttribute("aria-valuenow", totalAttendees);

  teamCards.forEach(function (teamCard) {
    teamCard.count = attendees.filter(function (attendee) {
      return attendee.team === teamCard.key;
    }).length;
    teamCard.countElement.textContent = teamCard.count;
  });

  updateCelebration(totalAttendees);

  renderAttendees();
}

function updateCelebration(totalAttendees) {
  teamCards.forEach(function (teamCard) {
    teamCard.cardElement.classList.remove("winning-team");
  });

  if (totalAttendees < maxAttendees) {
    goalCelebration.hidden = true;
    return;
  }

  let highestTeamCount = 0;
  teamCards.forEach(function (teamCard) {
    if (teamCard.count > highestTeamCount) {
      highestTeamCount = teamCard.count;
    }
  });

  const winningTeams = teamCards.filter(function (teamCard) {
    return teamCard.count === highestTeamCount;
  });
  const winningTeamNames = winningTeams.map(function (teamCard) {
    teamCard.cardElement.classList.add("winning-team");
    return teamCard.name;
  });

  if (winningTeamNames.length === 1) {
    goalCelebrationText.textContent = `Goal reached! ${winningTeamNames[0]} leads the summit with ${highestTeamCount} attendees!`;
  } else {
    goalCelebrationText.textContent = `Goal reached! ${winningTeamNames.join(" and ")} are tied for the top turnout with ${highestTeamCount} attendees each!`;
  }

  goalCelebration.hidden = false;
}

function renderAttendees() {
  attendeeList.replaceChildren();
  emptyRoster.hidden = attendees.length > 0;

  attendees.forEach(function (attendee, index) {
    const listItem = document.createElement("li");
    const checkInStamp = document.createElement("span");
    const attendeeInfo = document.createElement("div");
    const name = document.createElement("span");
    const team = document.createElement("span");
    const removeButton = document.createElement("button");

    listItem.className = "attendee-item";
    checkInStamp.className = "check-in-stamp";
    checkInStamp.textContent = `#${index + 1}`;
    checkInStamp.setAttribute("aria-hidden", "true");
    attendeeInfo.className = "attendee-info";
    name.className = "attendee-name";
    name.textContent = attendee.name;
    team.className = `attendee-team ${attendee.team}`;
    team.textContent = attendee.teamName;
    removeButton.type = "button";
    removeButton.className = "remove-button";
    removeButton.setAttribute("aria-label", `Remove ${attendee.name}`);
    removeButton.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>';
    removeButton.addEventListener("click", function () {
      attendees.splice(index, 1);
      saveAttendees();
      updateAttendance();
      showMessage(`${attendee.name} was removed from the roster.`, "success");
    });

    attendeeInfo.append(name, team);
    listItem.append(checkInStamp, attendeeInfo, removeButton);
    attendeeList.append(listItem);
  });
}

function showMessage(message, messageType) {
  greeting.textContent = message;
  greeting.className = `${messageType}-message`;
  greeting.style.display = "block";
}

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = attendeeNameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.options[teamSelect.selectedIndex].text;
  const alreadyCheckedIn = attendees.some(function (attendee) {
    return attendee.name.toLowerCase() === name.toLowerCase();
  });

  if (alreadyCheckedIn) {
    showMessage(`${name} is already checked in.`, "error");
    return;
  }

  if (attendees.length >= maxAttendees) {
    showMessage("The summit has reached its 50-person capacity.", "error");
    return;
  }

  attendees.push({ name: name, team: team, teamName: teamName });
  saveAttendees();
  updateAttendance();
  animateTeamEmoji(team);

  let personalizedGreeting = `Welcome, ${name}!`;

  if (team === "water") {
    personalizedGreeting = `Welcome, ${name}! Team Water Wise is ready to protect every drop with you.`;
  } else if (team === "zero") {
    personalizedGreeting = `Welcome, ${name}! Team Net Zero is one step closer to a cleaner future with you.`;
  } else if (team === "power") {
    personalizedGreeting = `Welcome, ${name}! Team Renewables is bringing clean energy to the summit with you.`;
  }

  showMessage(personalizedGreeting, "success");
  checkInForm.reset();
  attendeeNameInput.focus();
});

clearAttendeesBtn.addEventListener("click", function () {
  if (attendees.length === 0) {
    showMessage("The roster is already empty.", "error");
    return;
  }

  if (window.confirm("Clear all summit check-ins?")) {
    attendees = [];
    saveAttendees();
    updateAttendance();
    showMessage("The check-in roster has been cleared.", "success");
  }
});

updateAttendance();
