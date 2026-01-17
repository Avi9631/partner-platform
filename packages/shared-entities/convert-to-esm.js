import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function convertToESM(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Convert require statements to import
  // Pattern: const { x, y } = require('module');
  const destructuredRequirePattern = /const\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\);?/g;
  if (destructuredRequirePattern.test(content)) {
    content = content.replace(destructuredRequirePattern, 'import {$1} from \'$2\';');
    modified = true;
  }

  // Pattern: const x = require('module');
  const simpleRequirePattern = /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g;
  if (simpleRequirePattern.test(content)) {
    content = content.replace(simpleRequirePattern, 'import $1 from \'$2\';');
    modified = true;
  }

  // Convert module.exports to export default
  if (content.includes('module.exports = ')) {
    content = content.replace(/module\.exports\s*=\s*/g, 'export default ');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function processDirectory(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      if (convertToESM(filePath)) {
        console.log(`✅ Converted: ${path.relative(process.cwd(), filePath)}`);
        count++;
      }
    }
  });

  return count;
}

const srcDir = path.join(__dirname, 'src');
const count = processDirectory(srcDir);
console.log(`\n✅ Total files converted: ${count}`);
