document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('checkInForm');
  const nameInput = document.getElementById('attendeeName');
  const teamSelect = document.getElementById('teamSelect');
  const attendeeCountEl = document.getElementById('attendeeCount');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const greetingEl = document.getElementById('greeting');
  const attendeeList = document.getElementById('attendeeList');
  const waterCountEl = document.getElementById('waterCount');
  const zeroCountEl = document.getElementById('zeroCount');
  const powerCountEl = document.getElementById('powerCount');

  let attendees = [];
  let goalReached = false;

  function loadAttendees() {
    try {
      const raw = localStorage.getItem('attendees');
      attendees = raw ? JSON.parse(raw) : [];
      // restore persisted counts if present and set goal state
      try {
        var countsRaw = localStorage.getItem('attendanceCounts');
        if (countsRaw) {
          var counts = JSON.parse(countsRaw);
          // if counts.total is at or above goal, mark goalReached so celebration is preserved after refresh
          var max = 50;
          if (counts.total >= max) {
            goalReached = true;
          }
        }
      } catch (e) {
        // ignore malformed counts
      }
    } catch (err) {
      attendees = [];
    }
  }

  function saveAttendees() {
    try {
      localStorage.setItem('attendees', JSON.stringify(attendees));
      // also persist derived counts for quick restore
      var total = attendees.length;
      var counts = {
        total: total,
        water: attendees.filter(function(a) { return a.team === 'water'; }).length,
        zero: attendees.filter(function(a) { return a.team === 'zero'; }).length,
        power: attendees.filter(function(a) { return a.team === 'power'; }).length
      };
      localStorage.setItem('attendanceCounts', JSON.stringify(counts));
    } catch (err) {
      console.error('Failed to save attendees or counts', err);
    }
  }

  function teamDisplayName(team) {
    if (team === 'water') return 'Team Water Wise';
    if (team === 'zero') return 'Team Net Zero';
    if (team === 'power') return 'Team Renewables';
    return team;
  }

  function getWinningTeam() {
    var counts = {
      water: attendees.filter(function(a) { return a.team === 'water'; }).length,
      zero: attendees.filter(function(a) { return a.team === 'zero'; }).length,
      power: attendees.filter(function(a) { return a.team === 'power'; }).length
    };
    var maxCount = Math.max(counts.water, counts.zero, counts.power);
    var winners = [];
    if (counts.water === maxCount) winners.push(teamDisplayName('water'));
    if (counts.zero === maxCount) winners.push(teamDisplayName('zero'));
    if (counts.power === maxCount) winners.push(teamDisplayName('power'));
    return { teams: winners, count: maxCount };
  }

  function updateCounts() {
    const total = attendees.length;
    attendeeCountEl.textContent = total;

    const max = 50;
    const pct = Math.min(100, Math.round((total / max) * 100));
    if (progressBar) {
      progressBar.style.width = pct + '%';
      progressBar.setAttribute('aria-valuenow', total);
      progressBar.setAttribute('aria-valuemin', 0);
      progressBar.setAttribute('aria-valuemax', max);
    }
    if (progressText) {
      progressText.textContent = `${total}/${max}`;
    }

    const water = attendees.filter(function(a) { return a.team === 'water'; }).length;
    const zero = attendees.filter(function(a) { return a.team === 'zero'; }).length;
    const power = attendees.filter(function(a) { return a.team === 'power'; }).length;

    if (waterCountEl) waterCountEl.textContent = water;
    if (zeroCountEl) zeroCountEl.textContent = zero;
    if (powerCountEl) powerCountEl.textContent = power;

    // celebration when goal reached (only once)
    if (total >= max && !goalReached) {
      goalReached = true;
      var winner = getWinningTeam();
      if (greetingEl) {
        if (winner.teams.length === 1) {
          greetingEl.textContent = `🎉 Goal reached! Winning team: ${winner.teams[0]} (${winner.count} check-ins).`;
        } else {
          greetingEl.textContent = `🎉 Goal reached! It's a tie between ${winner.teams.join(' & ')} (${winner.count} each).`;
        }
        greetingEl.classList.add('celebration');
      }
    }
  }

  function renderAttendeeList() {
    if (!attendeeList) return;
    attendeeList.innerHTML = '';
    const recent = attendees.slice().reverse();
    for (var i = 0; i < recent.length; i++) {
      var a = recent[i];
      var li = document.createElement('li');
      li.className = 'attendee-item';
      var time = '';
      try { time = new Date(a.time).toLocaleTimeString(); } catch (e) { time = ''; }
      li.textContent = `${a.name} — ${teamDisplayName(a.team)} ${time ? '(' + time + ')' : ''}`;
      attendeeList.appendChild(li);
    }
  }

  // Initialize UI from storage
  loadAttendees();
  updateCounts();
  renderAttendeeList();

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var name = nameInput.value.trim();
    var team = teamSelect.value;
    if (!name || !team) {
      greetingEl.textContent = 'Please enter a name and select a team.';
      return;
    }

    var attendee = {
      name: name,
      team: team,
      time: new Date().toISOString()
    };

    attendees.push(attendee);
    saveAttendees();
    updateCounts();
    renderAttendeeList();

    // Personalized welcome message
    greetingEl.textContent = `Welcome, ${name}! Thanks for checking in with ${teamDisplayName(team)}.`;

    // Reset form for next user
    nameInput.value = '';
    teamSelect.selectedIndex = 0;
    nameInput.focus();
  });
});
