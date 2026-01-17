/**
 * Convert ES Modules to CommonJS
 * This script converts all .js files in shared-validation from ESM to CJS
 */


import fs from 'fs';
import path from 'path';

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Convert import { z } from 'zod' to const { z } = require('zod')
  if (content.includes("import { z } from 'zod'")) {
    content = content.replace(/import\s+\{\s*z\s*\}\s+from\s+['"]zod['"]/g, "const { z } = require('zod')");
    modified = true;
  }

  // Convert import statements
  content = content.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"](.+?)['"]/g, (match, name, mod) => {
    modified = true;
    return `const ${name} = require('${mod}')`;
  });

  content = content.replace(/import\s+(\w+)\s+from\s+['"](.+?)['"]/g, (match, name, mod) => {
    modified = true;
    return `const ${name} = require('${mod}')`;
  });

  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](.+?)['"]/g, (match, imports, mod) => {
    modified = true;
    return `const {${imports}} = require('${mod}')`;
  });

  // Convert export const/export function
  content = content.replace(/export\s+const\s+(\w+)\s*=/g, (match, name) => {
    modified = true;
    return `const ${name} =`;
  });

  content = content.replace(/export\s+function\s+(\w+)/g, (match, name) => {
    modified = true;
    return `function ${name}`;
  });

  // Find all exported names
  const exportedNames = [];
  const namedExportRegex = /export\s+\{\s*([^}]+)\s*\}/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(n => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts.length > 1 ? parts[1] : parts[0];
    });
    exportedNames.push(...names);
  }

  // Remove export { ... } statements
  content = content.replace(/export\s+\{[^}]+\};?\s*/g, '');

  // Convert export default
  const defaultExportMatch = content.match(/export\s+default\s+(\w+);/);
  if (defaultExportMatch) {
    const defaultName = defaultExportMatch[1];
    content = content.replace(/export\s+default\s+\w+;/, '');
    
    if (exportedNames.length > 0) {
      content += `\n\nmodule.exports = ${defaultName};\nmodule.exports.${defaultName} = ${defaultName};\n`;
      exportedNames.forEach(name => {
        content += `module.exports.${name} = ${name};\n`;
      });
    } else {
      content += `\n\nmodule.exports = ${defaultName};\n`;
    }
    modified = true;
  } else if (exportedNames.length > 0) {
    content += `\n\nmodule.exports = {\n  ${exportedNames.join(',\n  ')}\n};\n`;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Converted: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += walkDir(filePath);
    } else if (file.endsWith('.js')) {
      if (convertFile(filePath)) {
        count++;
      }
    }
  }

  return count;
}

const sharedValidationPath = path.join(__dirname, '..', 'shared-validation');
console.log('Converting ES Modules to CommonJS...\n');
const count = walkDir(sharedValidationPath);
console.log(`\n✅ Converted ${count} files`);
