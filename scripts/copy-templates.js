import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src/templates');
const destDir = path.resolve('dist/src/templates');

try {
  if (fs.existsSync(srcDir)) {
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    fs.cpSync(srcDir, destDir, { recursive: true });
    console.log('✅ Templates copied successfully to build folder.');
  } else {
    console.error('❌ Source templates folder not found!');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to copy templates:', error);
  process.exit(1);
}
