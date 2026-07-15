// this works as the grammar for the language

// TypeScript String Literal Union.
export type NodeType =
// statement
  | "Program"
  | "varDeclaration"

//   expressions
  | "BinaryExp"
  | "NumericLiteral"
  | "Identifier"
  | "NullLiteral";
// we can aslo include functionDeclaration,unaryExpression,callExpression

export interface Stmt {
  kind: NodeType;
}
export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
  // body expects an array of Stmt, it is polymorphic. It means it can hold absolutely anything that extends Stmt
}
export interface varDeclaration extends Stmt {
  kind: "varDeclaration";
  constant:boolean;
  value?: Expr;
  identifier:string;
}

export interface Expr extends Stmt {}

export interface BinaryExp extends Expr {
  kind: "BinaryExp";
  left: Expr;
  right: Expr;
  operator: string;
}

export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}

export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

export interface NullLiteral extends Expr {
  kind: "NullLiteral";
  value: "null";
}
