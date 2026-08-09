const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findAndReplace(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findAndReplace(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf-8');
            let modified = false;

            // Simple Regex to find <img ... >
            // We want to add loading="lazy" and decoding="async" if they aren't already there.
            // Also skip if fetchpriority="high" is present.
            
            content = content.replace(/<img([^>]*)>/g, (match, p1) => {
                if (p1.includes('fetchpriority="high"')) {
                    return match;
                }
                
                let newAttr = p1;
                if (!newAttr.includes('loading="lazy"')) {
                    newAttr += ' loading="lazy"';
                    modified = true;
                }
                if (!newAttr.includes('decoding="async"')) {
                    newAttr += ' decoding="async"';
                    modified = true;
                }
                
                if (modified) {
                    return `<img${newAttr}>`;
                }
                return match;
            });

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf-8');
                console.log(`Updated: ${filePath}`);
            }
        }
    });
}

findAndReplace(srcDir);
console.log('Done.');
