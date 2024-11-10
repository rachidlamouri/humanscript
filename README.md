# Humanscript

High level programming language for the game [Human Resource Machine](https://store.steampowered.com/app/375820/Human_Resource_Machine/).

Need a new way to play the game? Try writing programs with `humanscript`, and then compiling them into in-game code
(`hassembly`) with this project. Just copy the compiled code to your clipboard and use the
in-game "paste" button :tada:.

| Humanscript (write code) | Hassembly (compile and copy) | Game (paste and run) |
| --- | --- | --- |
| ![humanscript code example](./readme-images/humanscript-code.png) | ![hassembly code example](./readme-images/hassembly-code.png) | ![game code example](./readme-images/game-code.png)|

**note**: This project was built for linux and may not work on windows (try [wsl](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux) instead!)

## VSCode Syntax Highlighting and Language Support

Do you like pretty colors? Do you use VSCode? If so, then run the following command to install a local vscode extension
that provides language support for `humanscript` (the high level code), and `hassembly` (the compiled game code). Run
the `Developer: Reload Window` command from the command palette and VSCode should automatically apply your theme to
`.hus` and `.husc` files.

This also adds comment support for the `ctrl + /` shortcut, and it adds icons for `.hus` and `.husc` files.

```sh
npm run -w syntax-highlighting/ update
```

## Terminal Setup

Installs the expected version of node via `nvm` and installs dependencies.

```sh
. ./setup
```

## Compiling Quick Start

Create a file named `example.hus` with the following code

```hus
outbox = inbox
```

Then run

```sh
npm run compile example.hus
```

This should output an `example.husc` file whose contents can be copy and pasted into the game.

## Compiling

**note**: The humanscript parser is written with [parsimmon](https://github.com/jneen/parsimmon/blob/master/API.md), and relies on
parsimmon's default behavior for reporting syntax errors.

```sh
# See the programs/ directory for example programs
npm run compile <program-filepath>

# Compile all programs in the programs/ directory
npm run compile -- --levels
```

## Language Features

TBD

## Limitations

The compiler's functionality, and thus the `humanscript` language, is limited by the in-game language. It is recommended that you play the game normally first to understand the limitations of the in-game language.

### Literals

In most programming languages you can define a literal such as `var num = 5` or `var letter = 'a'`, but there isn't a reliable way to
create numbers out of thin air in Human Resource Machine. Instead, the game provides literals for you in certain levels,
and you can create variables that reference those floor slots.

The only exceptions are:

- `0` can be used in the right hand side of a logical comparison since it leverages the `JUMPZ` hassembly command
- `1` can be used in increment and decrement assignment statements since they leverage the `BUMPUP` and `BUMPDN`
  hassembly commands

### Optimization

Compiled code is not optimized and is not intended to be optimized since it overcomplicates the compiler. To achieve
separation of concerns, compiled statements cannot know the value left in the in-game character's hands after the
previous statement. Therefore, extra floor slots are needed for registers to persist data, and extra code is needed to
read these registers or to re-read a value that may have just been written to.
