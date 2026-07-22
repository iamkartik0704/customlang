# ToadCode Interpreter

ToadCode is a custom, dynamically typed toy programming language built entirely from scratch in TypeScript. It includes a custom lexer, parser, and tree-walk interpreter. 

I built this project to understand how programming languages work under the hood.

## Features

Even though it's a toy language, it supports a decent amount of features:
- **Variables**: `let` for mutable variables and `const` for immutable ones.
- **Data Types**: Numbers, Strings, Booleans, Null.
- **Data Structures**: Objects (JSON-like) and Arrays.
- **Functions**: Named functions (`fn`), Arrow functions (`=>`), and native functions (like `toad()`, `time()`).
- **Control Flow**: `if` / `else` statements.
- **Loops**: `for` and `while` loops.
- **Math & Logic**: Standard math operators (`+`, `-`, `*`, `/`, `%`), logical/comparison operators (`==`, `!=`, `<`, `>`, `<=`, `>=`), and unary operators (`!`, `-`).
- **Methods**: Array and String methods (`.length`, `.push()`, `.pop()`, `.split()`).

## Reserved Keywords

The following keywords are reserved in ToadCode and cannot be used as identifiers (variable or function names):
- `let`, `const`
- `fn`, `return`
- `if`, `else`
- `while`, `for`
- `true`, `false`, `null`

## Getting Started

Since the interpreter is written in TypeScript, you'll need Node.js and `tsc` installed on your machine.

1. Clone the repository and navigate to the project directory.
2. Compile the TypeScript files:
   ```bash
   tsc main.ts
   ```
3. Run a ToadCode file by passing it to the interpreter:
   ```bash
   node main.js your_file.txt
   ```

## Syntax Quickstart

Here is a quick look at what ToadCode syntax looks like. 

### Variables and Objects
```javascript
let x = 10;
const y = 20;

let person = {
    name: "Toad",
    age: 5
};

let arr = [1, 2, 3];
```

### Control Flow
```javascript
if (x < y && y == 20) {
    toad(1); // toad() is the native print function
} else {
    toad(0);
}
```

### Loops
```javascript
let sum = 0;
for (let i = 0; i < 5; i = i + 1) {
    sum = sum + i;
}

let count = 0;
while (count < 3) {
    count = count + 1;
}
```

### Functions
Functions support returning values, recursion, and arrow function syntax.
```javascript
// Named Function
fn fib(n) {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}

// Arrow Function
let multiply = (a, b) => a * b;

toad(fib(6)); // prints 8
```

### Methods & Member Expressions
ToadCode has built-in support for array and string manipulations:
```javascript
let arr = [1, 2, 3];
arr.push(4);
toad(arr.length); // 4

let str = "hello world";
let parts = str.split(" "); // ["hello", "world"]
```

## How it works

The interpreter is split into three main phases:
1. **Lexer** (`lexer.ts`): Reads the raw source code string and breaks it down into an array of meaningful tokens.
2. **Parser** (`parser.ts`): Takes the array of tokens and constructs an Abstract Syntax Tree (AST) using recursive descent parsing.
3. **Interpreter** (`interpreter.ts`): Traverses the AST and evaluates it against an Environment (`env.ts`) which stores variables and scope frames.
