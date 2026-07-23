const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

if (!content.includes('lazy,')) {
  content = content.replace("import React from 'react';", "import React, { lazy, Suspense } from 'react';");
}
if (!content.includes('Suspense')) {
  content = content.replace("import React, { lazy }", "import React, { lazy, Suspense }");
}

const pageImportRegex = /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+['"](\.\/pages\/[A-Za-z0-9_]+)['"];/g;
content = content.replace(pageImportRegex, "const $1 = lazy(() => import('$2').then(m => ({ default: m.$1 || m.default })));");

const defaultPageImportRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"](\.\/pages\/[A-Za-z0-9_]+)['"];/g;
content = content.replace(defaultPageImportRegex, "const $1 = lazy(() => import('$2').then(m => ({ default: m.default || m.$1 })));");

const pageLoader = `
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);
`;
if (!content.includes('PageLoader')) {
  content = content.replace('const AuthLayout:', pageLoader + '\nconst AuthLayout:');
}

content = content.replace(/<Routes>/g, '<Suspense fallback={<PageLoader />}><Routes>');
content = content.replace(/<\/Routes>/g, '</Routes></Suspense>');

fs.writeFileSync(appTsxPath, content);
console.log('App.tsx updated');
