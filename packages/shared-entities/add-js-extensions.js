import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addJsExtensions(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: import ... from './relative' or '../relative'
  // This matches imports that don't already have .js extension
  const relativeImportPattern = /(import\s+(?:{[^}]+}|[\w]+|\*\s+as\s+\w+)\s+from\s+['"])(\.[^'"]+?)(['"];?)/g;
  
  content = content.replace(relativeImportPattern, (match, before, importPath, after) => {
    // Check if it already has .js or .json extension
    if (importPath.endsWith('.js') || importPath.endsWith('.json') || importPath.endsWith('.mjs')) {
      return match; // Already has extension
    }
    
    modified = true;
    return `${before}${importPath}.js${after}`;
  });

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
      if (addJsExtensions(filePath)) {
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
