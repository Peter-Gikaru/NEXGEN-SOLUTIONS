import fs from 'fs';
import path from 'path';
import stripComments from 'strip-comments';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      if (fs.statSync(dirFile).isDirectory()) {
        filelist = walkSync(dirFile, filelist);
      } else {
        if (dirFile.match(/\.(js|jsx|ts|tsx)$/)) {
          filelist.push(dirFile);
        }
      }
    } catch (err) {}
  });
  return filelist;
};

const frontendFiles = walkSync(path.join(process.cwd(), 'src'));
const backendFiles = walkSync(path.join(process.cwd(), 'backend', 'src'));

const allFiles = [...frontendFiles, ...backendFiles];

allFiles.forEach(file => {
  try {
    const code = fs.readFileSync(file, 'utf8');
    const stripped = stripComments(code);
    fs.writeFileSync(file, stripped, 'utf8');
  } catch (err) {
    console.error(`Error processing ${file}: ${err.message}`);
  }
});
console.log(`Processed ${allFiles.length} files and stripped comments.`);
