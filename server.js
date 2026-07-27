const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const ATTENDEES_FILE = path.join(__dirname, 'attendees.json');

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Helper function to read attendees from file
function readAttendees() {
  try {
    if (fs.existsSync(ATTENDEES_FILE)) {
      const data = fs.readFileSync(ATTENDEES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading attendees file:', err);
  }
  return [];
}

// Helper function to write attendees to file
function writeAttendees(attendees) {
  try {
    fs.writeFileSync(ATTENDEES_FILE, JSON.stringify(attendees, null, 2));
  } catch (err) {
    console.error('Error writing attendees file:', err);
  }
}

// API endpoint to get all attendees
app.get('/api/attendees', function(req, res) {
  const attendees = readAttendees();
  res.json(attendees);
});

// API endpoint to save attendees
app.post('/api/attendees', function(req, res) {
  const attendees = req.body;
  if (!Array.isArray(attendees)) {
    return res.status(400).json({ error: 'attendees must be an array' });
  }
  writeAttendees(attendees);
  res.json({ success: true, count: attendees.length });
});

// Start server
app.listen(PORT, function() {
  console.log(`Event Check-In server running at http://localhost:${PORT}`);
  console.log(`Attendees data will be saved to ${ATTENDEES_FILE}`);
});
