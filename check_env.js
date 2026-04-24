const fs = require('fs');
console.log("CWD:", process.cwd());
try {
  console.log("Directory contents:", fs.readdirSync('.').join(', '));
} catch(e) {}

['README.md', 'PRD.md', 'package.json'].forEach(f => {
  try {
    const s = fs.statSync(f);
    console.log(`${f}:\n  Created  (birthtime): ${s.birthtime.toISOString()}\n  Modified (mtime):     ${s.mtime.toISOString()}\n`);
  } catch(e) {
    console.log(`${f}: Not found\n`);
  }
});
