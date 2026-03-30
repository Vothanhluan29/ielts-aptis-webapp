import fs from 'fs';
import path from 'path';

// Danh sách thư mục cần tạo
const folders = [
  'src/components',
  'src/config',
  'src/layouts',
  'src/features/auth',
  'src/features/exam',
  'src/features/dashboard/api',
  'src/features/dashboard/components',
  'src/features/dashboard/hooks',
  'src/features/reading',
  'src/hooks',
  'src/routes',
  'src/services',
  'src/utils',
  'src/assets'
];

// Danh sách file cần tạo
const files = [
  'src/services/axiosClient.js',
  'src/services/apiEndpoints.js'
];

// 1. Tạo thư mục
folders.forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    console.log(`✅ Created folder: ${folder}`);
  }
});

// 2. Tạo file rỗng
files.forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '// File created automatically');
    console.log(`✅ Created file: ${file}`);
  }
});

console.log('🎉 Setup hoàn tất!');