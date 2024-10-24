import fs from 'fs';
import { compile } from './compiler/compiler';
import { assertIsNotUndefined } from './utils/assertIsNotUndefined';
import { parseArgs } from 'util';
import { posix } from 'path';

const {
  positionals: [inputFilePath],
  values: { levels: compileLevels = false },
} = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    levels: { type: 'boolean' },
  },
});

let filePaths: string[];

if (compileLevels) {
  const directory = './programs';
  filePaths = fs
    .readdirSync(directory)
    .filter((file) => !file.endsWith('c'))
    .map((file) => posix.join(directory, file));
} else {
  assertIsNotUndefined(inputFilePath);
  filePaths = [inputFilePath];
}

filePaths.forEach((filePath) => {
  console.log(`Compiling: ${filePath}`);
  const inputCode = fs.readFileSync(filePath, 'utf8');
  const outputCode = compile(inputCode);

  const outputFilePath = filePath + 'c';
  fs.writeFileSync(outputFilePath, outputCode);
  console.log(`Compiled: ${outputFilePath}`);
  console.log();
});
