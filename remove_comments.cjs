const fs = require('fs');
const path = require('path');
const strip = require('strip-comments');

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const dirPath = path.join(dir, f);
    const stat = fs.statSync(dirPath);
    if (stat.isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist' && f !== 'build') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  }
}

walkDir(__dirname, (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    try {
      const stripped = strip(content);
      if (stripped !== content) {
        fs.writeFileSync(filePath, stripped, 'utf8');
        console.log(`Stripped comments from ${filePath}`);
      }
    } catch (e) {
      console.error(`Error processing ${filePath}:`, e);
    }
  }
});
