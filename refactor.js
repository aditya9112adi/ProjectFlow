const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'backend', 'src'),
  path.join(__dirname, 'frontend', 'src')
];

function replaceContent(content) {
  let newContent = content.replace(/Instructor/g, 'Admin');
  newContent = newContent.replace(/instructor/g, 'admin');
  newContent = newContent.replace(/INSTRUCTOR/g, 'ADMIN');
  return newContent;
}

function processPath(currentPath) {
  const stats = fs.statSync(currentPath);

  if (stats.isDirectory()) {
    // Process children first
    const children = fs.readdirSync(currentPath);
    for (const child of children) {
      processPath(path.join(currentPath, child));
    }

    // Rename directory if needed
    const dirName = path.basename(currentPath);
    if (dirName.toLowerCase().includes('instructor')) {
      let newDirName = dirName.replace(/Instructor/g, 'Admin');
      newDirName = newDirName.replace(/instructor/g, 'admin');
      newDirName = newDirName.replace(/INSTRUCTOR/g, 'ADMIN');
      const newPath = path.join(path.dirname(currentPath), newDirName);
      console.log(`Renaming Directory: ${currentPath} -> ${newPath}`);
      fs.renameSync(currentPath, newPath);
    }
  } else if (stats.isFile()) {
    // Skip non-text files or specific files if needed
    const ext = path.extname(currentPath);
    if (!['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css', '.html'].includes(ext)) {
      return;
    }

    // Read and replace content
    let content = fs.readFileSync(currentPath, 'utf8');
    const newContent = replaceContent(content);
    if (content !== newContent) {
      console.log(`Updated Content: ${currentPath}`);
      fs.writeFileSync(currentPath, newContent, 'utf8');
    }

    // Rename file if needed
    const fileName = path.basename(currentPath);
    if (fileName.toLowerCase().includes('instructor')) {
      let newFileName = fileName.replace(/Instructor/g, 'Admin');
      newFileName = newFileName.replace(/instructor/g, 'admin');
      newFileName = newFileName.replace(/INSTRUCTOR/g, 'ADMIN');
      const newPath = path.join(path.dirname(currentPath), newFileName);
      console.log(`Renaming File: ${currentPath} -> ${newPath}`);
      fs.renameSync(currentPath, newPath);
    }
  }
}

console.log('Starting refactor...');
for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    processPath(dir);
  } else {
    console.warn(`Directory not found: ${dir}`);
  }
}
console.log('Refactor complete!');
