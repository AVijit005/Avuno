const fs = require('fs');

const data = fs.readFileSync('src/components/landing-v2/LandingV2StoryChapters.tsx', 'utf8');

// A very naive tag counter for debugging DesktopChapters function
const lines = data.split('\n').slice(0, 275);
let openDivs = 0;
let openMotionDivs = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const divs = (line.match(/<div/g) || []).length;
  const closeDivs = (line.match(/<\/div>/g) || []).length;
  const selfCloseDivs = (line.match(/<div[^>]*\/>/g) || []).length;
  
  openDivs += divs - closeDivs - selfCloseDivs;
  
  const motionDivs = (line.match(/<motion\.div/g) || []).length;
  const closeMotionDivs = (line.match(/<\/motion\.div>/g) || []).length;
  const selfCloseMotionDivs = (line.match(/<motion\.div[^>]*\/>/g) || []).length;
  
  openMotionDivs += motionDivs - closeMotionDivs - selfCloseMotionDivs;
  
  if (i > 150) {
    console.log(`Line ${i+1}: div:${openDivs} motion.div:${openMotionDivs} | ${line.trim()}`);
  }
}

console.log('Final open divs:', openDivs);
console.log('Final open motion divs:', openMotionDivs);
