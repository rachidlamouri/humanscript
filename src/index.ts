import fs from 'fs';
import { compile } from './compiler/compiler';
import { assertIsNotUndefined } from './utils/assertIsNotUndefined';

const [inputFilePath] = process.argv.slice(2);
assertIsNotUndefined(inputFilePath);

const inputCode = fs.readFileSync(inputFilePath, 'utf8');
const outputCode = compile(inputCode);

const outputFilePath = inputFilePath + 'c';

fs.writeFileSync(outputFilePath, outputCode);

console.log(`Compiled: ${outputFilePath}`);
