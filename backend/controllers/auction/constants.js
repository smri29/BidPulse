// ---------------------------------------------------------------------------
// Module: backend/controllers/auction/constants.js
// Purpose: constants
// This file belongs to the modular backend structure and isolates one clear
// responsibility so the overall system is easier to understand and maintain.
// ---------------------------------------------------------------------------

const REGISTRATION_WINDOWS = [24, 120, 192, 240, 360, 480];
const REGISTRATION_DAYS = [1, 5, 8, 10, 15, 20];
const TEST_REGISTRATION_MINUTES = [2, 5];
const ROOM_OPEN_TIMEOUT_SECONDS = 30;

module.exports = {
  REGISTRATION_WINDOWS,
  REGISTRATION_DAYS,
  TEST_REGISTRATION_MINUTES,
  ROOM_OPEN_TIMEOUT_SECONDS,
};


