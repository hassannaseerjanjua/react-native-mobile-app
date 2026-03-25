#!/usr/bin/env node

const readline = require('readline');
const { exec } = require('child_process');
const run = (command, options) => {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
};
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const appId = '1:115559184211:android:9e404adb7884cb9b6353a6';
const notificationGroup = 'qa-testers';
const buildPath = 'android/app/build/outputs/apk/release/app-release.apk';

// Prompt for release notes
rl.question('Enter release notes for this build:\n', async releaseNotes => {
  // Check if release notes were provided
  if (!releaseNotes || !releaseNotes.trim()) {
    console.error('Error: Release notes cannot be empty');
    rl.close();
    process.exit(1);
  }

  try {
    console.log('Distributing build to Firebase App Distribution...');

    const { stdout, stderr } = await run(
      `firebase appdistribution:distribute ${buildPath} --app ${appId} --release-notes "${releaseNotes.trim()}"`,
    );

    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }

    console.log('✅ Build distributed successfully!');
    rl.close();
  } catch (error) {
    console.error('❌ Error distributing build:', error.message);
    rl.close();
    process.exit(1);
  }
});
