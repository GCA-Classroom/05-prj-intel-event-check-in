// Select DOM elements
const checkInForm = document.getElementById('checkInForm');
const attendeeNameInput = document.getElementById('attendeeName');
const teamSelect = document.getElementById('teamSelect');
const greeting = document.getElementById('greeting');
const attendeeCountSpan = document.getElementById('attendeeCount');
const progressBar = document.getElementById('progressBar');

const waterCountSpan = document.getElementById('waterCount');
const zeroCountSpan = document.getElementById('zeroCount');
const powerCountSpan = document.getElementById('powerCount');

// Create/Select container for the Attendee List LevelUp
const container = document.querySelector('.container');
const attendeeListSection = document.createElement('div');
attendeeListSection.innerHTML = `
    <h3 style="margin-top: 2rem;">Recent Check-Ins</h3>
    <ul id="attendeeList" style="list-style-type: none; padding: 0; margin-top: 0.5rem;"></ul>
`;
container.appendChild(attendeeListSection);
const attendeeListUl = document.getElementById('attendeeList');

// Initialize tracking variables from localStorage or default to 0/empty
let totalAttendees = parseInt(localStorage.getItem('totalAttendees')) || 0;
let waterCount = parseInt(localStorage.getItem('waterCount')) || 0;
let zeroCount = parseInt(localStorage.getItem('zeroCount')) || 0;
let powerCount = parseInt(localStorage.getItem('powerCount')) || 0;
let attendeeRecords = JSON.parse(localStorage.getItem('attendeeRecords')) || [];

const maxCapacity = 50; // Defined goal

// Run initial UI load with saved data
updateUI();

// Listen for form submission
checkInForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = attendeeNameInput.value.trim();
    const team = teamSelect.value;

    if (name === '' || team === '') return;

    // Increment counts
    totalAttendees++;
    if (team === 'water') waterCount++;
    else if (team === 'zero') zeroCount++;
    else if (team === 'power') powerCount++;

    // Add new attendee record
    attendeeRecords.push({ name: name, team: team, teamName: getTeamDisplayName(team) });

    // Save to localStorage (LevelUp)
    saveData();

    // Update screen display
    updateUI();

    // Display personalized greeting
    greeting.textContent = `Welcome, ${name}! Successfully checked in for Team ${getTeamDisplayName(team)}.`;

    // Check if goal is reached (LevelUp: Celebration Feature)
    if (totalAttendees >= maxCapacity) {
        triggerCelebration();
    }

    // Clear form inputs
    attendeeNameInput.value = '';
    teamSelect.selectedIndex = 0;
});

// Helper function to update all DOM elements and lists
function updateUI() {
    attendeeCountSpan.textContent = totalAttendees;
    waterCountSpan.textContent = waterCount;
    zeroCountSpan.textContent = zeroCount;
    powerCountSpan.textContent = powerCount;

    // Update progress bar
    const progressPercentage = Math.min((totalAttendees / maxCapacity) * 100, 100);
    progressBar.style.width = progressPercentage + '%';

    // Render Attendee List (LevelUp)
    attendeeListUl.innerHTML = '';
    attendeeRecords.forEach(record => {
        const li = document.createElement('li');
        li.textContent = `${record.name} - Team ${record.teamName}`;
        li.style.padding = '6px 10px';
        li.style.margin = '4px 0';
        li.style.background = '#f4f4f4';
        li.style.borderRadius = '4px';
        li.style.fontSize = '0.9rem';
        attendeeListUl.appendChild(li);
    });
}

// Helper function to save current stats into localStorage
function saveData() {
    localStorage.setItem('totalAttendees', totalAttendees);
    localStorage.setItem('waterCount', waterCount);
    localStorage.setItem('zeroCount', zeroCount);
    localStorage.setItem('powerCount', powerCount);
    localStorage.setItem('attendeeRecords', JSON.stringify(attendeeRecords));
}

// Helper function for clean team display names
function getTeamDisplayName(teamKey) {
    if (teamKey === 'water') return 'Water Wise';
    if (teamKey === 'zero') return 'Net Zero';
    if (teamKey === 'power') return 'Renewables';
    return '';
}

// Celebration Feature LevelUp Logic
function triggerCelebration() {
    let winningTeam = 'Water Wise';
    let max = waterCount;
    if (zeroCount > max) { winningTeam = 'Net Zero'; max = zeroCount; }
    if (powerCount > max) { winningTeam = 'Renewables'; }

    greeting.style.color = '#0071c5';
    greeting.style.fontWeight = 'bold';
    greeting.textContent = `🎉 GOAL REACHED! The Sustainability Summit is at full capacity! Winning Team: Team ${winningTeam} with ${max} check-ins! 🎉`;
}
