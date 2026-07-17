// this works as the grammar for the language

// TypeScript String Literal Union.
export type NodeType =
  // statement
  | "Program"
  | "varDeclaration"
  | "FunctionDeclaration"

  //   expressions
  | "MemberExpr"
  | "CallExpr"
  | "Property"
  | "ObjectLiteral" // object is an array of properties
  | "AssignmentExpr"
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
  constant: boolean;
  value?: Expr;
  identifier: string;
}

export interface FunctionDeclaration extends Stmt {
  kind: "FunctionDeclaration";
  parameters:string[];
  name:string;
  body:Stmt[];
  // can add async and arrow keys as bool here 

}

export interface Expr extends Stmt {}
export interface AssignmentExpr extends Expr {
  kind: "AssignmentExpr";
  assigne: Expr;
  /*
  why are we choosing assigne to be Expr and not string
  say x = {flower:"lily"}
  but when i want to update it i would write:
  x.flower = "marigold"
  so here x.flower this thing is not a string
  
   */
  value: Expr;
}

export interface BinaryExp extends Expr {
  kind: "BinaryExp";
  left: Expr;
  right: Expr;
  operator: string;
}

export interface CallExpr extends Expr {
  kind: "CallExpr";
  args: Expr[];
  caller: Expr;
  // why caller is not an identifier:
  // we may call like this:-    print()    or         print.number() where the later is a member expression
}

export interface MemberExpr extends Expr {
  kind: "MemberExpr";
  object: Expr;
  property: Expr;
  computed: boolean;
  // why need for computed:
  // print.number () is equivalent to print["number"]   where the later:  have to compute the identifier as the string literal
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

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value?: Expr;
}

export interface ObjectLiteral extends Expr {
  kind: "ObjectLiteral";
  properties: Property[];
}
