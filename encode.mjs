import fs from 'fs';
const data = fs.readFileSync('public/logo.png');
const base64 = data.toString('base64');
fs.writeFileSync('lib/logoBase64.ts', `export const LOGO_BASE64 = "data:image/png;base64,${base64}";\n`);
console.log('Done');
