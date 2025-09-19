#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to match number input fields that need fixing
const numberInputPattern = /onChange=\{.*parseFloat\(e\.target\.value\)/g;
const integerInputPattern = /onChange=\{.*parseInt\(e\.target\.value/g;

// Replacement patterns
const numberInputReplacement = `onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string or valid number
                          if (value === "" || /^\\d*\\.?\\d*$/.test(value)) {
                            field.onChange(
                              value === ""
                                ? undefined
                                : parseFloat(value)
                            );
                          }
                        }}`;

const integerInputReplacement = `onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string or valid integer
                          if (value === "" || /^\\d*$/.test(value)) {
                            field.onChange(
                              value === ""
                                ? undefined
                                : parseInt(value, 10)
                            );
                          }
                        }}`;

// Find all TypeScript/JavaScript files in the app directory
const files = glob.sync('app/**/*.{ts,tsx}', { cwd: __dirname + '/..' });

let totalFilesFixed = 0;
let totalReplacements = 0;

console.log('🔍 Scanning for number input fields that need fixing...\n');

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  let fileReplacements = 0;

  // Fix number inputs (parseFloat)
  const numberMatches = content.match(numberInputPattern);
  if (numberMatches) {
    content = content.replace(numberInputPattern, numberInputReplacement);
    fileReplacements += numberMatches.length;
  }

  // Fix integer inputs (parseInt)
  const integerMatches = content.match(integerInputPattern);
  if (integerMatches) {
    content = content.replace(integerInputPattern, integerInputReplacement);
    fileReplacements += integerMatches.length;
  }

  // Write back if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalFilesFixed++;
    totalReplacements += fileReplacements;
    console.log(`✅ Fixed ${fileReplacements} input field(s) in: ${file}`);
  }
});

console.log(`\n🎉 Summary:`);
console.log(`   Files processed: ${files.length}`);
console.log(`   Files fixed: ${totalFilesFixed}`);
console.log(`   Total replacements: ${totalReplacements}`);

if (totalFilesFixed === 0) {
  console.log('\n✨ All input fields are already properly configured!');
} else {
  console.log('\n🚀 All number input fields have been fixed!');
  console.log('   You can now backspace and clear all digits properly.');
}
