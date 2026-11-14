// Mide game.js como lo hara el verificador, pero con DEV = 0 (el estado de entrega) aunque el archivo tenga DEV = 1.
// Uso: node kit/size.mjs
import { minify } from '@swc/core';
import { readFileSync } from 'fs';

const src = readFileSync('./game.js', 'utf-8');
const size = async (code) => Buffer.byteLength((await minify(code, { compress: true, mangle: true })).code, 'utf-8');
const dev = /const DEV = (\d);/.exec(src)[1];
const rel = await size(src.replace('const DEV = 1;', 'const DEV = 0;'));
const LIMIT = 50 * 1024;
console.log(`DEV=${dev} en el archivo | entrega (DEV=0): ${rel} bytes = ${(rel / 1024).toFixed(2)} KB | libres: ${LIMIT - rel} bytes`);
