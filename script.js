document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('checkInForm');
  const nameInput = document.getElementById('attendeeName');
  const teamSelect = document.getElementById('teamSelect');
  const attendeeCountEl = document.getElementById('attendeeCount');
  const progressBar = document.getElementById('progressBar');
  const greetingEl = document.getElementById('greeting');
  const attendeeList = document.getElementById('attendeeList');
  const waterCountEl = document.getElementById('waterCount');
  const zeroCountEl = document.getElementById('zeroCount');
  const powerCountEl = document.getElementById('powerCount');

  let attendees = [];

  function loadAttendees() {
    try {
      const raw = localStorage.getItem('attendees');
      attendees = raw ? JSON.parse(raw) : [];
    } catch (err) {
      attendees = [];
    }
  }

  function saveAttendees() {
    try {
      localStorage.setItem('attendees', JSON.stringify(attendees));
    } catch (err) {
      console.error('Failed to save attendees', err);
    }
  }

  function teamDisplayName(team) {
    if (team === 'water') return 'Team Water Wise';
    if (team === 'zero') return 'Team Net Zero';
    if (team === 'power') return 'Team Renewables';
    return team;
  }

  function updateCounts() {
    const total = attendees.length;
    attendeeCountEl.textContent = total;

    const max = 50;
    const pct = Math.min(100, Math.round((total / max) * 100));
    if (progressBar) {
      progressBar.style.width = pct + '%';
    }

    const water = attendees.filter(function(a) { return a.team === 'water'; }).length;
    const zero = attendees.filter(function(a) { return a.team === 'zero'; }).length;
    const power = attendees.filter(function(a) { return a.team === 'power'; }).length;

    if (waterCountEl) waterCountEl.textContent = water;
    if (zeroCountEl) zeroCountEl.textContent = zero;
    if (powerCountEl) powerCountEl.textContent = power;
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
