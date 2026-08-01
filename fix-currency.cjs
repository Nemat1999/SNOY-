const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace $100 -> PKR 100
    content = content.replace(/\$(\d+)/g, 'PKR $1');
    
    // Replace ${product.price} -> PKR ${product.price}
    // We target known money variable names to avoid replacing random template strings
    const regex = /\$(\{\s*[^}]*(?:price|Price|total|Total|amount|Amount|netProfit|profit|subtotal|discount|Discount)[^}]*\})/g;
    content = content.replace(regex, 'PKR $1');

    fs.writeFileSync(file, content);
});

console.log('Replaced currency symbols.');
