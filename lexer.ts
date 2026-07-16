// let x = 45 + (alpha*gamma)
// this would be in the array [letToken, IdentifierToke, EqualsToken, NumberToken]

// the following lines tell the compilor of TS to skip chceking the line beneath that
// @ts-ignore
import * as fs from "fs";
export enum Tokentype {
  Null,
  Number,
  Equals,
  Identifier,
  OpenParens,
  CloseParens,
  BinaryOperators,
  Error,
  Let,
  EOF,
  const,
  Semicolon,
  Colon,
  OpenBrace, // {
  CloseBrace, // }
  Comma,
}
/*

creating a record for keywords (acts like a dictionary){    record in TS is equivalent to std::unordered_map<string, Tokentype> in cpp ie stores key-value pairs
}

*/
// we can further customize this to add more keywords

const KEYWORDS: Record<string, Tokentype> = {
  let: Tokentype.Let,
  Null: Tokentype.Null,
  const: Tokentype.const,
};

// interface is TS is what struct in Cpp
export interface Token {
  value: string;
  type: Tokentype;
}

function token(val: string, type: Tokentype): Token {
  return { value: val, type };
}

// creating a function to check alphabets
function isalpha(src: string) {
  return src.toLowerCase() != src.toUpperCase();
}

// create a function to check for digits 0-9

// function isint(src:string){
//     const c = src.charCodeAt(0);
//     const bounds = ['0'.charCodeAt(0) , '9'.charCodeAt(0)];
//     return (c>=bounds[0] && c<=bounds[1]);
// }

// alternative code for this

function isint(src: string): boolean {
  return src >= "0" && src <= "9";
}

// now to handle whitespaces
function isSkippable(str: string) {
  return str == " " || str == "\n" || str == "\t" || str == "\r";
}

// we are now parsing the string into multiple tokens
export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split(""); // array of each character

  while (src.length > 0) {
    if (src[0] === "(") {
      tokens.push(token(src[0], Tokentype.OpenParens));
      src.shift();
    } else if (src[0] === ")") {
      tokens.push(token(src[0], Tokentype.CloseParens));
      src.shift();
    } else if (src[0] === "}") {
      tokens.push(token(src[0], Tokentype.CloseBrace));
      src.shift();
    } else if (src[0] === "{") {
      tokens.push(token(src[0], Tokentype.OpenBrace));
      src.shift();
    } else if (
      src[0] === "+" ||
      src[0] === "-" ||
      src[0] === "*" ||
      src[0] === "/" ||
      src[0] === "%"
    ) {
      tokens.push(token(src[0], Tokentype.BinaryOperators));
      src.shift();
    } else if (src[0] === "=") {
      tokens.push(token(src[0], Tokentype.Equals));
      src.shift();
    } else if (src[0] === ";") {
      tokens.push(token(src[0], Tokentype.Semicolon));
      src.shift();
    } else if (src[0] === ":") {
      tokens.push(token(src[0], Tokentype.Colon));
      src.shift();
    } else if (src[0] === ",") {
      tokens.push(token(src[0], Tokentype.Comma));
      src.shift();
    } else {
      // this would be responsible for handelling the multicharacter tokens
      // 1. handelling the number tokens

      if (isint(src[0])) {
        let num = "";
        // Allow digits AND the decimal point
        while (src.length > 0 && (isint(src[0]) || src[0] === ".")) {
          num += src.shift();
        }
        tokens.push(token(num, Tokentype.Number));
      }
      // concern- we need to handle the keywords
      else if (isalpha(src[0])) {
        let ident = "";
        while (src.length > 0 && isalpha(src[0])) {
          ident += src.shift();
        }
        // before simply entering this we need to check for
        const reserved = KEYWORDS[ident];
        if (typeof reserved == "number") {
          tokens.push(token(ident, reserved));
        } else {
          tokens.push(token(ident, Tokentype.Identifier));
        }
      } else if (isSkippable(src[0])) {
        src.shift();
        // simply shifting the current character
      } else {
        // unidentified character appears
        console.error(`unregistered character appearear , ${src[0]}`);
        tokens.push(token(src.shift() as string, Tokentype.Error));
      }
    }
  }
  tokens.push({ type: Tokentype.EOF, value: "EndOfTheFile" });

  return tokens;
}

// const sourceCode = fs.readFileSync("./test.txt", "utf-8");
// const tokens = tokenize(sourceCode);
// console.log(tokens);
