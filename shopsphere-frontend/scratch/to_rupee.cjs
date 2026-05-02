const fs = require('fs');
const path = require('path');

const dir = 'd:/ShopSphere - Copy/ShopSphere - Copy/shopsphere-frontend/src';

function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We want to replace `${` with `₹{` EXCEPT when inside backticks.
      // A simple way is to split by backticks. Everything at even indices (0, 2, 4...) is outside backticks.
      // Everything at odd indices (1, 3, 5...) is inside backticks.
      let parts = content.split('`');
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          // Outside backticks: replace ${ with ₹{
          parts[i] = parts[i].replace(/\$\{/g, '₹{');
        }
      }
      content = parts.join('`');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

walk(dir);
console.log("Done fixing currency symbols!");
