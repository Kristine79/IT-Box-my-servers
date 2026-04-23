const fs = require('fs');
const path = require('path');

async function download() {
  const treeUrl = "https://api.github.com/repos/gothicshoptrade-netizen/Myservershub/git/trees/main?recursive=1";
  const res = await fetch(treeUrl);
  const data = await res.json();
  
  if (!data.tree) {
    console.error("No tree found:", data);
    return;
  }

  const skip = [
    'firebase-applet-config.json',
    'metadata.json',
    'package-lock.json',
    '.gitignore'
  ];

  for (const item of data.tree) {
    if (item.type === 'blob') {
      if (skip.includes(item.path)) {
        console.log('Skipping ' + item.path);
        continue;
      }
      
      const rawUrl = `https://raw.githubusercontent.com/gothicshoptrade-netizen/Myservershub/main/${item.path}`;
      const contentRes = await fetch(rawUrl);
      const content = await contentRes.text();
      
      const filePath = path.join(__dirname, item.path);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
      console.log('Downloaded ' + item.path);
    }
  }
}
download();
