const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/AdminDashboard.jsx',
  'src/pages/StudentDashboard.jsx',
  'src/pages/TeacherDashboard.jsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace mixed quotes: `${BASE_URL}/api/some/path' => `${BASE_URL}/api/some/path`
  content = content.replace(/\$\{BASE_URL\}\/api\/([^']+)'/g, "${BASE_URL}/api/$1`");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed quotes in', file);
}
