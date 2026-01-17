/**
 * Convert CommonJS to ES Modules
 * This script converts require() to import statements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Skip if already using import
  if (content.includes('import ') && !content.includes('require(')) {
    return false;
  }

  const lines = content.split('\n');
  const newLines = [];
  const requireStatements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match: const name = require('module')
    const requireMatch = line.match(/^(\s*)const\s+(\{[^}]+\}|\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?\s*$/);
    if (requireMatch) {
      const [, indent, name, modulePath] = requireMatch;
      requireStatements.push({ indent, name, modulePath, lineIndex: i });
      modified = true;
      continue;
    }

    // Match: require('module') without assignment (like require('./src/config/tracing'))
    const bareRequireMatch = line.match(/^(\s*)require\(['"]([^'"]+)['"]\);?\s*$/);
    if (bareRequireMatch) {
      const [, indent, modulePath] = bareRequireMatch;
      newLines.push(`${indent}import '${modulePath}';`);
      modified = true;
      continue;
    }

    newLines.push(line);
  }

  // Add import statements at the beginning (after any comments)
  if (requireStatements.length > 0) {
    let insertIndex = 0;
    // Find first non-comment, non-empty line
    while (insertIndex < newLines.length) {
      const line = newLines[insertIndex].trim();
      if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
        break;
      }
      insertIndex++;
    }

    // Convert require statements to imports
    const imports = requireStatements.map(({ name, modulePath }) => {
      // Add .js extension if it's a local file without extension
      let finalPath = modulePath;
      if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
        if (!modulePath.match(/\.\w+$/)) {
          finalPath = `${modulePath}.js`;
        }
      }
      return `import ${name} from '${finalPath}';`;
    });

    newLines.splice(insertIndex, 0, ...imports, '');
  }

  // Convert module.exports
  content = newLines.join('\n');
  content = content.replace(/module\.exports\s*=\s*(\w+);?/g, 'export default $1;');
  content = content.replace(/module\.exports\.(\w+)\s*=\s*([^;]+);?/g, 'export const $1 = $2;');
  content = content.replace(/exports\.(\w+)\s*=\s*([^;]+);?/g, 'export const $1 = $2;');

  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Converted: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  return false;
}

function walkDir(dir, excludeDirs = ['node_modules', 'dist', 'build']) {
  const files = fs.readdirSync(dir);
  let count = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        count += walkDir(filePath, excludeDirs);
      }
    } else if (file.endsWith('.js') && file !== 'convert-to-esm.js') {
      if (convertFile(filePath)) {
        count++;
      }
    }
  }

  return count;
}

const backendPath = __dirname;
console.log('Converting CommonJS to ES Modules...\n');
const count = walkDir(backendPath);
console.log(`\n✅ Converted ${count} files`);
console.log('\n⚠️  Manual fixes may be needed for:');
console.log('  - __dirname and __filename (use import.meta.url)');
console.log('  - Dynamic requires');
console.log('  - Circular dependencies');
