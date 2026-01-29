/**
 * CSV to SQL Insert Generator
 * Run: node scripts/import-cohort-data.js
 * Copy output and paste into Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'C1-C6 - Sheet1 (1).csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

const lines = csvContent.split('\n').filter(line => line.trim());

// Generate SQL INSERT statements
console.log('-- Import verified members from CSV');
console.log('-- Run this in Supabase SQL Editor\n');
console.log('BEGIN;\n');

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Split by comma, but handle quoted fields
  const parts = [];
  let current = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim()); // Add last field

  if (parts.length < 3) continue;

  const name = parts[0].replace(/^"|"$/g, '').trim();
  const email = parts[1].replace(/^"|"$/g, '').trim().toLowerCase();
  const cohort = parts[2].replace(/^"|"$/g, '').replace('Cohort ', '').trim();

  // Skip invalid rows
  if (!name || !email || !cohort || !email.includes('@')) continue;

  // Escape single quotes
  const escapedName = name.replace(/'/g, "''");
  const escapedEmail = email.replace(/'/g, "''");

  console.log(`INSERT INTO verified_members (full_name, email, cohort) VALUES ('${escapedName}', '${escapedEmail}', 'Cohort ${cohort}');`);
}

console.log('\nCOMMIT;');
console.log('\n-- Verify import');
console.log('SELECT cohort, COUNT(*) as count FROM verified_members GROUP BY cohort ORDER BY cohort;');
