const crypto = require("crypto");

// Password hashing with Node's built-in scrypt (memory-hard, no extra dependency).
// Stored format: "<salt hex>:<hash hex>". Plain-text passwords are never stored.
const KEY_LEN = 64;

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash, "hex");
  const actual = crypto.scryptSync(password, salt, KEY_LEN);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

// Used when the username doesn't exist, so response time doesn't reveal valid usernames
const DUMMY_HASH = hashPassword("not-a-real-password");

module.exports = { hashPassword, verifyPassword, DUMMY_HASH };
