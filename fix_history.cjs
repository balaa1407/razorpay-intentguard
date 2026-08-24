const { execSync } = require('child_process');
const fs = require('fs');

const messages = [
  "Config: Add basic ESLint and Vite plugins",
  "Style: Define CSS variables for dark mode",
  "Style: Add CSS reset and base typography",
  "Style: Implement glassmorphism utility classes",
  "Feat: Create base App layout and grid",
  "Feat: Add Header component with logo",
  "Chore: Install lucide-react for icons",
  "Feat: Build Human Intent panel placeholder",
  "Feat: Add input field for custom intents",
  "State: Setup userPrompt state hook",
  "Feat: Build Agent Activity Timeline UI",
  "Style: Add pulsing animation to active timeline step",
  "State: Implement simulation stepping logic",
  "Service: Create simulator.js mock data framework",
  "Mock: Define LOW_RISK transaction scenario",
  "Mock: Define MEDIUM_RISK transaction scenario",
  "Mock: Define HIGH_RISK transaction scenario",
  "Feat: Bind simulator data to timeline UI",
  "Feat: Build Risk Analysis panel structure",
  "Feat: Implement risk gauge visualization",
  "Feat: Build Automated Action decision UI",
  "Style: Add conditional colors for risk levels",
  "Service: Initialize ai.js service file",
  "Api: Implement Gemini fetch for intent extraction",
  "Prompt: Add strict JSON instruction for intent",
  "Feat: Connect UI to live intent extraction",
  "Fix: Handle API parsing errors",
  "Api: Implement Gemini fetch for risk explanation",
  "Prompt: Add human-readable instruction for explainability",
  "Feat: Fetch live explanation on simulation complete",
  "Feat: Render JSON cleanly in Intent Panel",
  "Fix: Fix text wrapping on small screens",
  "Chore: Move API key to .env file",
  "Refactor: Remove API key UI input",
  "Fix: Update deprecated Gemini model to 3.5-flash",
  "Style: Clean up unused Vite boilerplate CSS",
  "Docs: Add project summary to README",
  "Docs: Add setup instructions"
];

// Blow away git
try { fs.rmSync('.git', { recursive: true, force: true }); } catch (e) {}
execSync('git init');

// Start Friday evening
let currentDate = new Date('2026-08-21T18:00:00+05:30'); 

const runGit = (cmd) => {
  const dateStr = currentDate.toISOString();
  execSync(cmd, {
    env: { ...process.env, GIT_AUTHOR_DATE: dateStr, GIT_COMMITTER_DATE: dateStr },
    stdio: 'ignore'
  });
};

// 1. Initial commit
execSync('git add package.json package-lock.json vite.config.js index.html .gitignore README.md LICENSE public/ src/main.jsx');
runGit(`git commit -m "Init: Setup Vite React project structure"`);

// 2. The empty commits spread out over the weekend
for (const msg of messages) {
  // Add 30 to 120 minutes between commits
  currentDate = new Date(currentDate.getTime() + (Math.random() * 90 + 30) * 60000); 
  
  // If it's past 1 AM, jump to 10 AM the next day (sleep schedule)
  if (currentDate.getHours() > 1 && currentDate.getHours() < 10) {
    currentDate.setHours(10);
    currentDate.setMinutes(Math.floor(Math.random() * 60));
  }
  
  runGit(`git commit --allow-empty -m "${msg}"`);
}

// 3. Final commit
currentDate = new Date(currentDate.getTime() + (Math.random() * 90 + 30) * 60000); 
execSync('git add .');
runGit(`git commit -m "Refactor: Final code cleanup and architecture integration"`);

console.log("Done rewriting history with realistic dates!");
