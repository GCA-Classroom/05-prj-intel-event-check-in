const eventCapacity = 50;
const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};
const storageKey = "sustainabilitySummitAttendees";

let attendees = loadAttendees();

const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const progressTrack = document.querySelector(".progress-track");
const celebrationMessage = document.getElementById("celebrationMessage");
const celebrationText = document.getElementById("celebrationText");
const checkInButton = document.getElementById("checkInBtn");
const rosterBody = document.getElementById("rosterBody");
const rosterCount = document.getElementById("rosterCount");
const rosterSearch = document.getElementById("rosterSearch");
const emptyState = document.getElementById("emptyState");
const noResults = document.getElementById("noResults");

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = attendeeNameInput.value.trim();
  const team = teamSelect.value;

  if (name === "" || team === "") {
    showMessage("Please enter a name and choose a team.", true);
    return;
  }

  if (attendees.length >= eventCapacity) {
    showMessage("The event has reached its check-in capacity.", true);
    return;
  }

  if (isAlreadyCheckedIn(name)) {
    showMessage(`${name} is already checked in.`, true);
    return;
  }

  attendees.push({
    id: createAttendeeId(),
    name: name,
    team: team,
    participating: false,
  });

  saveAttendees();
  renderDashboard();
  showMessage(
    `Welcome, ${name}! You are checked in with ${teamNames[team]}.`,
    false,
  );
  checkInForm.reset();
  attendeeNameInput.focus();
});

rosterSearch.addEventListener("input", function () {
  renderRoster();
});

rosterBody.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-attendee-id]");

  if (button === null) {
    return;
  }

  const attendeeId = button.getAttribute("data-attendee-id");

  for (let index = 0; index < attendees.length; index += 1) {
    if (attendees[index].id === attendeeId) {
      attendees[index].participating = !attendees[index].participating;
      break;
    }
  }

  saveAttendees();
  renderDashboard();
});

function loadAttendees() {
  try {
    const savedAttendees = localStorage.getItem(storageKey);

    if (savedAttendees === null) {
      return [];
    }

    const parsedAttendees = JSON.parse(savedAttendees);

    if (Array.isArray(parsedAttendees)) {
      return getValidAttendees(parsedAttendees);
    }

    if (!parsedAttendees || !Array.isArray(parsedAttendees.attendees)) {
      return [];
    }

    return getValidAttendees(parsedAttendees.attendees);
  } catch (error) {
    return [];
  }
}

function getValidAttendees(attendeeList) {
  return attendeeList.filter(function (attendee) {
    return (
      attendee && typeof attendee.name === "string" && teamNames[attendee.team]
    );
  });
}

function saveAttendees() {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        attendees: attendees,
        totalAttendance: attendees.length,
        teamCounts: getTeamCounts(),
      }),
    );
  } catch (error) {
    showMessage(
      "Your browser could not save this roster. It will reset when you leave.",
      true,
    );
  }
}

function createAttendeeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isAlreadyCheckedIn(name) {
  const normalizedName = name.toLowerCase();

  for (let index = 0; index < attendees.length; index += 1) {
    if (attendees[index].name.toLowerCase() === normalizedName) {
      return true;
    }
  }

  return false;
}

function showMessage(message, isError) {
  greeting.textContent = message;
  greeting.classList.toggle("error", isError);
}

function renderDashboard() {
  const participatingCount = attendees.filter(function (attendee) {
    return attendee.participating;
  }).length;
  const teamsPresent = [];
  const teamCounts = getTeamCounts();

  attendeeCount.textContent = attendees.length;
  document.getElementById("overviewCheckedIn").textContent = attendees.length;
  document.getElementById("overviewParticipating").textContent =
    participatingCount;

  for (let index = 0; index < attendees.length; index += 1) {
    if (!teamsPresent.includes(attendees[index].team)) {
      teamsPresent.push(attendees[index].team);
    }
  }

  document.getElementById("overviewTeams").innerHTML =
    `${teamsPresent.length} <span>of 3</span>`;
  progressBar.style.width = `${Math.min((attendees.length / eventCapacity) * 100, 100)}%`;
  progressTrack.setAttribute("aria-valuenow", attendees.length);
  checkInButton.disabled = attendees.length >= eventCapacity;
  renderTeamCounts(teamCounts);
  renderCelebration(teamCounts);
  renderRoster();
}

function getTeamCounts() {
  const teamCounts = {
    water: 0,
    zero: 0,
    power: 0,
  };

  for (let index = 0; index < attendees.length; index += 1) {
    teamCounts[attendees[index].team] += 1;
  }

  return teamCounts;
}

function renderTeamCounts(teamCounts) {
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("powerCount").textContent = teamCounts.power;
}

function renderCelebration(teamCounts) {
  if (attendees.length < eventCapacity) {
    celebrationMessage.hidden = true;
    return;
  }

  const teamKeys = Object.keys(teamCounts);
  let highestCount = 0;
  let winningTeams = [];

  for (let index = 0; index < teamKeys.length; index += 1) {
    const teamKey = teamKeys[index];

    if (teamCounts[teamKey] > highestCount) {
      highestCount = teamCounts[teamKey];
      winningTeams = [teamKey];
    } else if (teamCounts[teamKey] === highestCount) {
      winningTeams.push(teamKey);
    }
  }

  const winningTeamNames = winningTeams.map(function (teamKey) {
    return teamNames[teamKey];
  });

  if (winningTeamNames.length === 1) {
    celebrationText.innerHTML = `Goal reached! <strong>${winningTeamNames[0]}</strong> leads the turnout.`;
  } else {
    celebrationText.innerHTML = `Goal reached! <strong>${winningTeamNames.join(" and ")}</strong> are tied for the top turnout.`;
  }

  celebrationMessage.hidden = false;
}

function renderRoster() {
  const searchTerm = rosterSearch.value.trim().toLowerCase();
  let visibleCount = 0;
  let rosterHTML = "";

  for (let index = attendees.length - 1; index >= 0; index -= 1) {
    const attendee = attendees[index];

    if (attendee.name.toLowerCase().includes(searchTerm)) {
      rosterHTML += createRosterRow(attendee);
      visibleCount += 1;
    }
  }

  rosterBody.innerHTML = rosterHTML;
  rosterCount.textContent = attendees.length;
  emptyState.hidden = attendees.length > 0;
  noResults.hidden = attendees.length === 0 || visibleCount > 0;
}

function createRosterRow(attendee) {
  const participationLabel = attendee.participating
    ? "Participating"
    : "Mark participating";
  const participationIcon = attendee.participating ? "fa-check" : "fa-plus";
  const activeClass = attendee.participating ? " active" : "";
  const firstInitial = escapeHTML(attendee.name.charAt(0).toUpperCase());
  const safeName = escapeHTML(attendee.name);
  const safeTeamName = escapeHTML(teamNames[attendee.team]);
  const safeId = escapeHTML(attendee.id);

  return `<tr>
		<td><div class="attendee-cell"><span class="attendee-initial" aria-hidden="true">${firstInitial}</span><span>${safeName}</span></div></td>
		<td><span class="team-tag ${attendee.team}">${safeTeamName}</span></td>
		<td><button class="participation-toggle${activeClass}" type="button" data-attendee-id="${safeId}" aria-pressed="${attendee.participating}"><i class="fas ${participationIcon}" aria-hidden="true"></i>${participationLabel}</button></td>
	</tr>`;
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

renderDashboard();
