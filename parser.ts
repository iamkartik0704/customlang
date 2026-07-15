import { Token, tokenize, Tokentype } from "./lexer";
import {
  Expr,
  BinaryExp,
  NumericLiteral,
  Identifier,
  Program,
  Stmt,
  NullLiteral,
  varDeclaration,
  AssignmentExpr,
} from "./ast";

export default class Parser {
  private tokens: Token[] = [];

  private notEOF(): boolean {
    return this.tokens[0].type != Tokentype.EOF;
  }
  private parseSMT(): Stmt {
    // since we dont have different statments rn{program is a statement rest all the 3 are expressions}
    switch (this.at().type) {
      case Tokentype.Let:
      case Tokentype.const:
        return this.parseVarDeclartion();
      default:
        return this.parseExp();
    }
  }
  // LET identifier;        // only declaration
  // (let||const) identifier = Expr;       // assignment along with declaration
  parseVarDeclartion(): Stmt {
    const isConstant = this.eat().type == Tokentype.const;
    const identifier = this.expect(
      Tokentype.Identifier,
      "expected identifier name following let and const keyword",
    ).value;

    if (this.at().type == Tokentype.Semicolon) {
      this.eat(); // expect a semicolon
      if (isConstant) {
        throw new Error(
          `A value must be assigned if using const keyword for declaration`,
        );
      }
      return {
        kind: "varDeclaration",
        identifier,
        constant: false,
      } as varDeclaration;
    }
    this.expect(
      Tokentype.Equals,
      "expected equalto token following identifier in the var declaration",
    );

    const declaration = {
      kind: "varDeclaration",
      identifier,
      constant: isConstant,
      value: this.parseExp(),
    } as varDeclaration;

    this.expect(
      Tokentype.Semicolon,
      "variable declaration must end up with a semicolon",
    );
    return declaration;
  }
  private parseExp(): Expr {
    return this.parseAssignmentExpr();
  }
  
  parseAssignmentExpr(): Expr {
    const left = this.parsePAdditiveExpr();  
    if(this.at().type == Tokentype.Equals){
      this.eat();    // advances past equals
      const value = this.parseAssignmentExpr();
      // this has been done to handle x=alpha=beta;(chained equation)
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    } 
    return left;
  }


  private expect(type: Tokentype, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type !== type) {
      throw new Error(
        `Parser Error: ${err}\nExpected: ${type}\nReceived: ${JSON.stringify(prev)}`,
      );
    }
    return prev;
  }

  // (10+5) - 5
  private parsePAdditiveExpr(): Expr {
    let left = this.parseMultiplicativeExpr();
    // calling this for precedence

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parseMultiplicativeExpr();

      left = {
        kind: "BinaryExp",
        left,
        right,
        operator,
      } as BinaryExp;
    }
    return left;
  }
  private parseMultiplicativeExpr(): Expr {
    let left = this.parsePrimaryExpr();

    while (
      this.at().value == "*" ||
      this.at().value == "/" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parsePrimaryExpr();

      left = {
        kind: "BinaryExp",
        left,
        right,
        operator,
      } as BinaryExp;
    }
    return left;
  }

  private parsePrimaryExpr(): Expr {
    const tk = this.at().type;

    switch (tk) {
      case Tokentype.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;

      case Tokentype.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;
      // parseFloat provides the support for floating numbers as well

      case Tokentype.OpenParens: {
        this.eat(); // for opening param
        const value = this.parseExp();
        this.expect(
          Tokentype.CloseParens,
          "unexpected token found inside the parenthesised  expression. Expected closing parenthesis",
        ); // for closing param
        return value;
      }

      case Tokentype.Null:
        this.eat(); // advance past the null literal
        return { kind: "NullLiteral", value: "null" } as NullLiteral;

      default:
        throw new Error(
          `unexpected token type encountered while parsing: ${JSON.stringify(this.at())}`,
        );
    }
  }

  private at() {
    return this.tokens[0] as Token;
  }
  // now we have the ability to get to the current and the next advance token
  private eat() {
    return this.tokens.shift() as Token;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    // parse till end of file
    while (this.notEOF()) {
      program.body.push(this.parseSMT());
    }
    return program;
  }
}

// order of precedence:
/*

>>> highest one to be paresed at the last


primaryExpr
unary
multiplicative
additive
comparison
logical
functionCall
memberExpr
assignmentExpr
*/
