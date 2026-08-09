const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function fixSyntax(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            fixSyntax(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf-8');
            let modified = false;

            if (content.includes('/ loading="lazy" decoding="async">')) {
                content = content.replace(/\/ loading="lazy" decoding="async">/g, ' loading="lazy" decoding="async" />');
                modified = true;
            }
            if (content.includes('/ decoding="async">')) {
                content = content.replace(/\/ decoding="async">/g, ' decoding="async" />');
                modified = true;
            }
            if (content.includes('/ loading="lazy">')) {
                content = content.replace(/\/ loading="lazy">/g, ' loading="lazy" />');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf-8');
                console.log(`Fixed: ${filePath}`);
            }
        }
    });
}

fixSyntax(srcDir);
console.log('Done.');
