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
      // Try to load from server API first (persistent file storage)
      fetch('/api/attendees')
        .then(function(response) { return response.json(); })
        .then(function(data) {
          attendees = Array.isArray(data) ? data : [];
          updateUiAfterLoad();
        })
        .catch(function(err) {
          // Fallback to localStorage if server not available
          console.log('Server not available, using localStorage');
          loadFromLocalStorage();
          updateUiAfterLoad();
        });
    } catch (err) {
      loadFromLocalStorage();
      updateUiAfterLoad();
    }
  }

  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('attendees');
      attendees = raw ? JSON.parse(raw) : [];
      try {
        var countsRaw = localStorage.getItem('attendanceCounts');
        if (countsRaw) {
          var counts = JSON.parse(countsRaw);
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

  function updateUiAfterLoad() {
    // restore goal state from attendee count
    var max = 50;
    if (attendees.length >= max) {
      goalReached = true;
    }
    updateCounts();
    renderAttendeeList();
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
      
      // Save to server (persistent file storage)
      fetch('/api/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendees)
      }).catch(function(err) {
        console.log('Could not save to server, data saved in browser only');
      });
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

  function getRandomWelcomeMessage(name, team) {
    var messages = [
      `Welcome, ${name}! 🎉 Thanks for joining ${teamDisplayName(team)}.`,
      `Great to see you, ${name}! ✨ ${teamDisplayName(team)} is excited to have you.`,
      `${name} is here! 👋 Welcome to ${teamDisplayName(team)}.`,
      `Excellent! ${name} has checked in with ${teamDisplayName(team)}. 🌟`,
      `${name}, so glad you made it! ${teamDisplayName(team)} is ready to go! 💪`,
      `Welcome aboard, ${name}! ${teamDisplayName(team)} is stronger with you here. 🚀`,
      `Awesome! ${name} just joined ${teamDisplayName(team)}. Let's do this! ⚡`
    ];
    var index = Math.floor(Math.random() * messages.length);
    return messages[index];
  }

  function launchConfetti() {
    var container = document.getElementById('confetti-container');
    if (!container) return;

    var colors = ['#0071c5', '#00c7fd', '#22c55e', '#f97316', '#ec4899'];
    var confettiCount = 50;

    for (var i = 0; i < confettiCount; i++) {
      var confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = (Math.random() * 0.5) + 's';
      confetti.style.animationDuration = (2 + Math.random() * 1.5) + 's';
      confetti.style.width = (5 + Math.random() * 10) + 'px';
      confetti.style.height = confetti.style.width;
      container.appendChild(confetti);
    }

    // Clean up confetti after animation
    setTimeout(function() {
      container.innerHTML = '';
    }, 5000);
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
      // Launch confetti celebration
      launchConfetti();
    }
  }

  function renderAttendeeList() {
    if (!attendeeList) return;
    attendeeList.innerHTML = '';
    const recent = attendees.slice().reverse();
    for (var i = 0; i < recent.length; i++) {
      var a = recent[i];
      var li = document.createElement('li');
      li.className = `attendee-item ${a.team}`;
      
      var nameSpan = document.createElement('span');
      nameSpan.className = 'attendee-name';
      nameSpan.textContent = a.name;
      
      var teamSpan = document.createElement('span');
      teamSpan.className = 'attendee-team';
      teamSpan.textContent = `${teamDisplayName(a.team)}`;
      
      var timeSpan = document.createElement('span');
      timeSpan.className = 'attendee-time';
      try {
        var time = new Date(a.time).toLocaleTimeString();
        timeSpan.textContent = time;
      } catch (e) {
        timeSpan.textContent = '';
      }
      
      li.appendChild(nameSpan);
      li.appendChild(teamSpan);
      li.appendChild(timeSpan);
      attendeeList.appendChild(li);
    }
  }

  // Initialize UI from storage
  loadAttendees();

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

    // Personalized welcome message with variety
    greetingEl.textContent = getRandomWelcomeMessage(name, team);

    // Reset form for next user
    nameInput.value = '';
    teamSelect.selectedIndex = 0;
    nameInput.focus();
  });
});
