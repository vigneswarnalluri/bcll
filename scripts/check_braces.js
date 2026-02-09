
import fs from 'fs';
const content = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
let open = 0;
for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') open++;
    if (content[i] === '}') open--;
}
console.log('Balance:', open);
