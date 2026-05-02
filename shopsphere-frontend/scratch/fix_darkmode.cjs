const fs = require('fs');
const path = require('path');

const dir = 'd:/ShopSphere - Copy/ShopSphere - Copy/shopsphere-frontend/src';

// Replace hardcoded color classes with theme-aware equivalents
const replacements = [
  // Text colors
  [/text-gray-700/g, 'text-foreground/80'],
  [/text-gray-600/g, 'text-foreground/70'],
  [/text-gray-500/g, 'text-muted'],
  [/text-gray-400/g, 'text-muted'],
  [/text-gray-300/g, 'text-muted/60'],
  [/text-gray-200/g, 'text-muted/40'],
  [/text-gray-800/g, 'text-foreground/90'],
  [/text-gray-900/g, 'text-foreground'],
  [/text-gray-100/g, 'text-foreground/10'],
  // Background colors
  [/bg-white(?!\/)(?![a-z])/g, 'bg-card'],
  [/bg-gray-50(?!\/)(?![a-z])/g, 'bg-secondary/40'],
  [/bg-gray-100(?!\/)(?![a-z])/g, 'bg-secondary'],
  [/bg-gray-200(?!\/)(?![a-z])/g, 'bg-border'],
  // Border colors  
  [/border-gray-100(?!\/)(?![a-z])/g, 'border-border'],
  [/border-gray-200(?!\/)(?![a-z])/g, 'border-border'],
  [/border-gray-300(?!\/)(?![a-z])/g, 'border-border'],
  // Hover backgrounds
  [/hover:bg-gray-50(?!\/)(?![a-z])/g, 'hover:bg-secondary/40'],
  [/hover:bg-gray-100(?!\/)(?![a-z])/g, 'hover:bg-secondary'],
];

function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [pattern, replacement] of replacements) {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
          changed = true;
          content = newContent;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', path.basename(fullPath));
      }
    }
  }
}

walk(dir);
console.log("Done fixing dark mode colors!");
