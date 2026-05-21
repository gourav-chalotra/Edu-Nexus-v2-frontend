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

  // Add import if not present
  if (!content.includes("import { BASE_URL } from '../config';")) {
    content = content.replace(
      "import { useAuth } from '../context/AuthContext';",
      "import { useAuth } from '../context/AuthContext';\nimport { BASE_URL } from '../config';"
    );
  }

  // Replace fetch('/api/...) with fetch(`${BASE_URL}/api/...)
  content = content.replace(/fetch\('\/api\//g, "fetch(`${BASE_URL}/api/");
  
  // Replace fetch(`/api/...) with fetch(`${BASE_URL}/api/...)
  content = content.replace(/fetch\(`\/api\//g, "fetch(`${BASE_URL}/api/");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', file);
}
