const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace \` with `
  content = content.replace(/\\\`/g, '`');
  
  // Replace \${ with ${
  content = content.replace(/\\\$\{/g, '${');

  // Fix adminController double declare
  if (filePath.endsWith('adminController.js')) {
    const lines = content.split('\n');
    let found = false;
    content = lines.map(line => {
      if (line.includes("const { notifyAllStudents } = require('../services/notificationService');")) {
        if (!found) {
          found = true;
          return line;
        }
        return '';
      }
      return line;
    }).join('\n');
  }

  // Fix eligibilityController single quote issue
  if (filePath.endsWith('eligibilityController.js')) {
     content = content.replace(/'4\. Follow the company's tech stack in open-source projects',/g, "'4. Follow the company\\'s tech stack in open-source projects',");
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      fixFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'controllers'));
walkDir(path.join(__dirname, 'models'));
walkDir(path.join(__dirname, 'services'));
walkDir(path.join(__dirname, 'routes'));
walkDir(path.join(__dirname, 'utils'));
walkDir(path.join(__dirname, 'middleware'));
