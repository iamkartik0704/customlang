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
  Property,
  ObjectLiteral,
  CallExpr,
  MemberExpr,
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
      default: {
        const expr = this.parseExp();
        if (this.at().type == Tokentype.Semicolon) {
          this.eat();
        }
        return expr;
      }
    }
  }
  // LET identifier;        // only declaration
  // (let||const) identifier = Expr;       // assignment along with declaration
  private parseVarDeclartion(): Stmt {
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

  private parseAssignmentExpr(): Expr {
    const left = this.parseObjectExpr();
    if (this.at().type == Tokentype.Equals) {
      this.eat(); // advances past equals
      const value = this.parseAssignmentExpr();
      // this has been done to handle x=alpha=beta;(chained equation)
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }
    return left;
  }
  private parseObjectExpr(): Expr {
    if (this.at().type !== Tokentype.OpenBrace) {
      return this.parsePAdditiveExpr();
    }
    this.eat(); // advance past openBrace
    const properties = new Array<Property>();

    while (this.notEOF() && this.at().type !== Tokentype.CloseBrace) {
      // cases to handle
      // {key:val,}
      // {key,}
      const key = this.expect(
        Tokentype.Identifier,
        "Object Literal Expects a key",
      ).value;

      // {key,}
      if (this.at().type == Tokentype.Comma) {
        this.eat(); // advance past comma
        properties.push({ key, kind: "Property" } as Property);
        continue;
      }
      // {key}
      else if (this.at().type == Tokentype.CloseBrace) {
        properties.push({ key, kind: "Property" } as Property);
        continue;
      }
      // {key,val}
      this.expect(
        Tokentype.Colon,
        "Missing Colon following identifer in the object Literal",
      );
      const value = this.parseExp(); // value can be anything like array,object and not just a string only
      properties.push({ key, value, kind: "Property" });

      if (this.at().type != Tokentype.CloseBrace) {
        this.expect(
          Tokentype.Comma,
          "Expected comma or closing bracket following property! ",
        );
      }
    }

    this.expect(Tokentype.CloseBrace, "Object Literal missing Closing Bracket");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
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
    let left = this.parseCallMemberExpr();
    // we will give this.parseCallMemberExpr() more precedence than multiplication but less than parsePrimaryExpr()

    while (
      this.at().value == "*" ||
      this.at().value == "/" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parseCallMemberExpr();

      left = {
        kind: "BinaryExp",
        left,
        right,
        operator,
      } as BinaryExp;
    }
    return left;
  }
  // print.x()().y
  private parseCallMemberExpr(): Expr {
    let object = this.parsePrimaryExpr();

    while (
      this.at().type == Tokentype.Dot ||
      this.at().type == Tokentype.OpenSquare ||
      this.at().type == Tokentype.OpenParens
    ) {
      if (this.at().type == Tokentype.OpenParens) {
        object = {
          kind: "CallExpr",
          caller: object,
          args: this.parseArgs(),
        } as CallExpr;
      } else {
        const operator = this.eat();
        let property: Expr;
        let computed: boolean;

        if (operator.type == Tokentype.Dot) {
          computed = false;
          property = this.parsePrimaryExpr();
          if (property.kind != "Identifier") {
            throw new Error(`cannot use dot expression without RHS being an identifier`);
          }
        } else {
          computed = true;
          property = this.parseExp();
          this.expect(Tokentype.CloseSquare, "Missing closing bracket");
        }

        object = {
          kind: "MemberExpr",
          object,
          property,
          computed,
        } as MemberExpr;
      }
    }
    return object;
  }

  private parseArgs(): Expr[] {
    this.expect(Tokentype.OpenParens, "expected open parenthesis");
    const args =
      this.at().type == Tokentype.CloseParens ? [] : this.parseArguments();
    this.expect(Tokentype.CloseParens, "Missing closing parenthesis");
    return args;
  }

  private parseArguments(): Expr[] {
    // here we would get the list of the args
    const args = [this.parseAssignmentExpr()];
    // fn sum(x=5,y=10);  just to support this we are using assignmentExpr

    // we are parsing the fisrt value right here and then start from checking a comma
    while (this.at().type == Tokentype.Comma && this.eat()) {
      args.push(this.parseAssignmentExpr());
    }
    return args;
  }
  // the above two are almost similar except for the fact that one of them is the helper function of another

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
member 
call
unary
multiplicative
additive
comparison
logical
functionCall
memberExpr
object
assignmentExpr
*/
