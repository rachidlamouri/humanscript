import fs from 'fs';
import { compile } from './compiler/compiler';
import { assertIsNotUndefined } from './utils/assertIsNotUndefined';

const [filePath] = process.argv.slice(2);
assertIsNotUndefined(filePath);

const code = fs.readFileSync(filePath, 'utf8');
compile(code);
