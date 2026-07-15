import Parser from "./parser";
import { evaluate } from "./interpreter";

// Tell TypeScript 'require' exists
declare const require: any;

// Use standard 'readline' (callbacks), NOT 'readline/promises'
const readline = require("readline");
const process = (globalThis as any).process;

const parser = new Parser();
console.log("\nToad v1.0.0");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// We use a recursive function instead of a while loop for callbacks
function promptUser() {
    // rl.question takes a callback function that runs when the user hits Enter
    rl.question("π> ", function(input: string) {
        
        // Using indexOf to avoid ES5 includes() error
        if (!input || input.indexOf("exit") !== -1) {
            rl.close();
            return; // Exit the function to break the loop
        }

        try {
            const program = parser.produceAST(input);
            const result = evaluate(program);
            console.log(result);
        } catch (error: any) {
            console.error(error.message);
        }

        // Ask the next question (loops back to the top)
        promptUser();
    });
}

// Start the REPL
promptUser();

