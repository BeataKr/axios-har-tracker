const fs = require('fs');
const path = require('path');

function findCoverageFiles(dir = '.') {
  const files = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && entry.name.startsWith('coverage-')) {
        const lcovPath = path.join(fullPath, 'lcov.info');
        if (fs.existsSync(lcovPath)) {
          files.push(lcovPath);
        }
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }
  
  return files;
}

function joinCoverage() {
  try {
    const coverageFiles = findCoverageFiles();
    
    if (coverageFiles.length === 0) {
      console.log('No coverage files found');
      return;
    }
    
    let combinedCoverage = '';
    
    for (const file of coverageFiles) {
      const content = fs.readFileSync(file, 'utf8');
      combinedCoverage += content + '\n';
    }
    
    // Ensure coverage directory exists
    if (!fs.existsSync('coverage')) {
      fs.mkdirSync('coverage', { recursive: true });
    }
    
    fs.writeFileSync('coverage/lcov.info', combinedCoverage);
    console.log(`Combined ${coverageFiles.length} coverage files into coverage/lcov.info`);
  } catch (error) {
    console.error('Error joining coverage:', error);
    process.exit(1);
  }
}

joinCoverage();