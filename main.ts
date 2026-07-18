#!/usr/bin/env node
import Parser from "./parser";
import { evaluate } from "./interpreter";
import env, { createGlobalEnv } from "./env";
import { makeBoolean, makeNumber, NumberVal } from "./values";

// Tell TypeScript 'require' exists
declare const require: any;

const readline = require("readline");
const fs = require("fs");
const process = (globalThis as any).process;

const environment = createGlobalEnv();
const parser = new Parser();

function runFile(filename: string) {
    try {
        const input = fs.readFileSync(filename, "utf-8");
        const program = parser.produceAST(input);
        const result = evaluate(program, environment);
        // Print the result with depth: null to see the whole object structure
        
        
        
        console.dir(result, { depth: null });



    } catch (error: any) {
        console.error(error.message);
    }
}

function repl() {
    console.log("\nToad v1.0.0");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // We use a recursive function instead of a while loop for callbacks
    function promptUser() {
        rl.question("π> ", function(input: string) {
            
            // Using indexOf to avoid ES5 includes() error
            if (!input || input.indexOf("exit") !== -1) {
                rl.close();
                return; // Exit the function to break the loop
            }

            try {
                const program = parser.produceAST(input);
                const result = evaluate(program, environment);
                console.dir(result, { depth: null });
            } catch (error: any) {
                console.error(error.message);
            }

            // Ask the next question (loops back to the top)
            promptUser();
        });
    }

    // Start the REPL loop
    promptUser();
}

// Check if a filename was provided as an argument
// (e.g. `ts-node main.ts test.txt` or `node main.js test.txt`)
const filename = process.argv[2];
if (filename) {
    runFile(filename);
} else {
    repl();
}

// environment.declareVar("x", {value: 100, type: "number"} as NumberVal);
// environment.declareVar("x",makeNumber(45));
// environment.declareVar("true",makeBoolean(true));