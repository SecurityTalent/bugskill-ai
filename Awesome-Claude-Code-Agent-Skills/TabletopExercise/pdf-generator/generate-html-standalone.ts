#!/usr/bin/env bun

import { generateStandaloneHTML } from './generate-html.ts';
import { readFile, writeFile } from 'fs/promises';

const jsonData = await readFile('../exercises/rainbow-six-ddos-attack/exercise-data.json', 'utf-8');
const data = JSON.parse(jsonData);

console.log('🚀 Generating HTML for Rainbow Six DDoS exercise...');
const html = generateStandaloneHTML(data);

await writeFile('../exercises/rainbow-six-ddos-attack/Rainbow-Six-DDoS-Attack-Tabletop.html', html, 'utf-8');

console.log('✅ HTML generated successfully: ../exercises/rainbow-six-ddos-attack/Rainbow-Six-DDoS-Attack-Tabletop.html');
