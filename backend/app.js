// Import required modules
const express = require('express');
const path = require('path'); // <-- You need this module

// Initialize the express app
const app = express();
const PORT = 3000;

// Define the path to your frontend folder
const frontendPath = path.join(__dirname, '..', 'frontend');

// Middleware to parse form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all static files (HTML, images, etc.) from the 'frontend' directory
app.use(express.static(frontendPath));

// This fulfills the "store booking data temporarily" requirement
let bookings = [];

// --- Routes ---

// GET route for the homepage
// When a user visits '/', send them the index.html file from the 'frontend' folder.
app.get('/', (req, res) => {
  // --- UPDATED PATH ---
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// GET route for the booking page
// This route is technically now handled by express.static,
// but it's good to keep it for clarity.
app.get('/booking.html', (req, res) => {
  // --- UPDATED PATH ---
  res.sendFile(path.join(frontendPath, 'booking.html'));
});

/**
 * POST route to handle the form submission.
 * --- NO CHANGE NEEDED HERE ---
 * The form's action="/submit-booking" is a URL, not a file.
 * This server logic correctly intercepts that URL.
 */
app.post('/submit-booking', (req, res) => {
  try {
    const newBooking = req.body;
    console.log('Received new booking request:', newBooking);

    // Basic Validation / Availability Check
    const isConflict = bookings.some((booking) => {
      return (
        booking.roomType === newBooking.roomType &&
        booking.bookingDate === newBooking.bookingDate &&
        booking.timeSlot === newBooking.timeSlot
      );
    });

    if (isConflict) {
      console.log('Booking conflict detected.');
      res.redirect('/booking-failure');
    } else {
      bookings.push(newBooking);
      console.log('Booking successful. Current bookings:', bookings);
      res.redirect('/booking-success');
    }
  } catch (error) {
    console.error('Error processing booking:', error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

// --- Confirmation Pages (Simple HTML responses) ---

// Success page
app.get('/booking-success', (req, res) => {
  res.send(`
    <style>body { font-family: "Georgia", serif; text-align: center; padding-top: 50px; background-color: #f7f7f7; color: #333; } h1 { color: #cc0000; } a { color: #cc0000; text-decoration: none; font-weight: bold; }</style>
    <h1>Booking Request Received!</h1>
    <p>Your request has been successfully submitted for review.</p>
    <br>
    <a href="/index.html">Return to Homepage</a>
  `);
});

// Failure page (for conflicts)
app.get('/booking-failure', (req, res) => {
  res.send(`
    <style>body { font-family: "Georgia", serif; text-align: center; padding-top: 50px; background-color: #f7f7f7; color: #333; } h1 { color: #cc0000; } a { color: #cc0000; text-decoration: none; font-weight: bold; }</style>
    <h1>Booking Conflict</h1>
    <p>We're sorry, but the room you selected is already booked for that specific date and time.</p>
    <p>Please try a different time or room.</p>
    <br>
    <a href="/booking.html">Try Booking Again</a>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`UHSL Student Center server running at http://localhost:${PORT}`);
});