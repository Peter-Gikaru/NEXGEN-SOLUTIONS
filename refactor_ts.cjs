const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

const fixTsRegex = /\.then\(m => \(\{ default: m\.([A-Za-z0-9_]+) \|\| m\.default \}\)\)/g;
content = content.replace(fixTsRegex, ".then((m: any) => ({ default: m.$1 || m.default }))");

const fixTsRegex2 = /\.then\(m => \(\{ default: m\.default \|\| m\.([A-Za-z0-9_]+) \}\)\)/g;
content = content.replace(fixTsRegex2, ".then((m: any) => ({ default: m.default || m.$1 }))");

fs.writeFileSync(appTsxPath, content);
console.log('App.tsx TS errors fixed');
