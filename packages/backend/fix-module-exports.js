import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixModuleExports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace module.exports = { with export default {
  if (content.includes('module.exports = {')) {
    content = content.replace(/module\.exports\s*=\s*\{/g, 'export default {');
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
      if (fixModuleExports(filePath)) {
        console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
        count++;
      }
    }
  });

  return count;
}

const srcDir = path.join(__dirname, 'src');
const count = processDirectory(srcDir);
console.log(`\n✅ Total files fixed: ${count}`);
