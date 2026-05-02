const fs = require('fs');
const path = require('path');

const dir = 'd:/ShopSphere - Copy/ShopSphere - Copy/shopsphere-frontend/src';

function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We want to fix interpolation: `... ₹{ ...` inside backticks.
      // Since it's hard to perfectly match inside backticks, let's look at common patterns:
      
      // 1. URLs
      content = content.replace(/`\/([^`]*?)₹\{/g, '`/$1${');
      content = content.replace(/`http([^`]*?)₹\{/g, '`http$1${');
      
      // 2. ClassNames
      content = content.replace(/className=\{`([^`]*?)₹\{/g, 'className={`$1${');
      // What if there are multiple ₹{ in one className? 
      // Let's do a loop for className
      let prev;
      do {
          prev = content;
          content = content.replace(/(className=\{`[^`]*?)₹\{/g, '$1${');
      } while (content !== prev);

      // 3. to={`...₹{...}`}
      do {
          prev = content;
          content = content.replace(/(to=\{`[^`]*?)₹\{/g, '$1${');
      } while (content !== prev);

      // 4. aria-label={`...₹{...}`}
      do {
          prev = content;
          content = content.replace(/(aria-[a-z]+=\{`[^`]*?)₹\{/g, '$1${');
      } while (content !== prev);

      // 5. toast.success(`...₹{...}`)
      do {
          prev = content;
          content = content.replace(/(toast\.[a-z]+\(`[^`]*?)₹\{/g, '$1${');
      } while (content !== prev);

      // 6. Generic `...₹{...}` where it's clearly a template string (e.g. starting with ` )
      // We will match a backtick, then any non-backtick characters, then ₹{
      do {
          prev = content;
          content = content.replace(/(`[^`]*?)₹\{/g, '$1${');
      } while (content !== prev);

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

walk(dir);
console.log("Done fixing templates!");
