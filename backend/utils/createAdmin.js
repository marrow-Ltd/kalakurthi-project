/**
 * Run with: npm run create-admin
 * Creates the admin login in MongoDB — or resets its password if the username already exists
 * (use this if you ever forget the password). The password is hashed before it is saved.
 */
require("dotenv").config();
const readline = require("readline");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");
const { hashPassword } = require("./password");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });

let muted = false;
const origWrite = rl._writeToOutput;
rl._writeToOutput = function (str) {
  if (muted) return; // hide typed password
  origWrite.call(rl, str);
};

const ask = (q, { hidden = false } = {}) =>
  new Promise((resolve) => {
    rl.question(q, (answer) => {
      if (hidden) {
        muted = false;
        process.stdout.write("\n");
      }
      resolve(answer);
    });
    if (hidden) muted = true;
  });

const run = async () => {
  const username = (await ask("Admin username: ")).trim().toLowerCase();
  if (username.length < 3) throw new Error("Username must be at least 3 characters.");

  const password = await ask("Password (min 8 chars): ", { hidden: true });
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  const confirm = await ask("Confirm password: ", { hidden: true });
  if (password !== confirm) throw new Error("Passwords do not match.");
  rl.close();

  await connectDB();
  const passwordHash = hashPassword(password);
  const existing = await Admin.findOne({ username });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.passwordChangedAt = new Date();
    await existing.save();
    console.log(`✅ Password reset for admin "${username}".`);
  } else {
    await Admin.create({ username, passwordHash });
    console.log(`✅ Admin "${username}" created.`);
  }
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
