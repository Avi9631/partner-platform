import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function convertDefaultExportToNamed(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern: export default { func1, func2, func3 };
  // We need to extract the names and convert to: export { func1, func2, func3 };
  const defaultExportPattern = /export default \{\s*([^}]+)\s*\};/;
  const match = content.match(defaultExportPattern);
  
  if (match) {
    const exports = match[1];
    // Clean up the exports (remove newlines, extra spaces)
    const exportNames = exports
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);
    
    // Check if it's a simple list of names (not key: value pairs)
    const isSimpleExport = exportNames.every(name => !name.includes(':'));
    
    if (isSimpleExport) {
      const newExport = `export { ${exportNames.join(', ')} };`;
      content = content.replace(defaultExportPattern, newExport);
      modified = true;
    }
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
      if (convertDefaultExportToNamed(filePath)) {
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
