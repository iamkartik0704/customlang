import { makeNull, NativeFnValue, NullVal, NumberVal, ObjectVal, runtimeVal, ValueType, FunctionValue, ArrayVal, ReturnVal, booleanVal, makeBoolean } from "./values";
import {
  AssignmentExpr,
  BinaryExp,
  CallExpr,
  Identifier,
  NodeType,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Stmt,
  varDeclaration,
  FunctionDeclaration,
  ReturnStatement,
  IfStatement,
  WhileStatement,
  ForStatement,
  ArrayLiteral,
} from "./ast";
import Environment from "./env";
type env = Environment;

function evaluateProgram(program: Program, env: env): runtimeVal {
  let lastEvaluated: runtimeVal = makeNull();

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
    if (lastEvaluated.type === "return") {
      return (lastEvaluated as ReturnVal).value;
    }
  }
  return lastEvaluated;
}
function evaluateNumericBinaryExpr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string,
): NumberVal {
  let result: number;
  if (operator == "+") {
    result = lhs.value + rhs.value;
  } else if (operator == "-") {
    result = lhs.value - rhs.value;
  } else if (operator == "*") {
    result = lhs.value * rhs.value;
  } else if (operator == "/") {
    if (rhs.value == 0) {
      throw new Error(`Division by zero is not allowed`);
    }
    result = lhs.value / rhs.value;
  } else if (operator == "%") {
    result = lhs.value % rhs.value;
  } else {
    throw new Error(`${operator} operator has not been fed `);
  }

  return { value: result, type: "number" };
}
function evaluateBinaryExp(binop: BinaryExp, env: env): runtimeVal {
  const lhs = evaluate(binop.left, env);

  if (binop.operator === "&&") {
      const isLhsTruthy = lhs.type === "boolean" ? (lhs as booleanVal).value : true;
      if (!isLhsTruthy) return makeBoolean(false);
      const rhs = evaluate(binop.right, env);
      const isRhsTruthy = rhs.type === "boolean" ? (rhs as booleanVal).value : true;
      return makeBoolean(isRhsTruthy);
  }
  if (binop.operator === "||") {
      const isLhsTruthy = lhs.type === "boolean" ? (lhs as booleanVal).value : true;
      if (isLhsTruthy) return makeBoolean(true);
      const rhs = evaluate(binop.right, env);
      const isRhsTruthy = rhs.type === "boolean" ? (rhs as booleanVal).value : true;
      return makeBoolean(isRhsTruthy);
  }

  const rhs = evaluate(binop.right, env);

  if (lhs.type == "number" && rhs.type == "number") {
    if (binop.operator === "==") return makeBoolean((lhs as NumberVal).value == (rhs as NumberVal).value);
    if (binop.operator === "!=") return makeBoolean((lhs as NumberVal).value != (rhs as NumberVal).value);
    if (binop.operator === "<") return makeBoolean((lhs as NumberVal).value < (rhs as NumberVal).value);
    if (binop.operator === ">") return makeBoolean((lhs as NumberVal).value > (rhs as NumberVal).value);
    if (binop.operator === "<=") return makeBoolean((lhs as NumberVal).value <= (rhs as NumberVal).value);
    if (binop.operator === ">=") return makeBoolean((lhs as NumberVal).value >= (rhs as NumberVal).value);
    
    return evaluateNumericBinaryExpr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator,
    );
  }

  if (binop.operator === "==") {
      return makeBoolean((lhs as any).value === (rhs as any).value);
  }
  if (binop.operator === "!=") {
      return makeBoolean((lhs as any).value !== (rhs as any).value);
  }

  // if any or both are null
  return makeNull();
}

function evaluateIdentifier(ident: Identifier, env: env) {
  return env.lookVar(ident.symbol);
}

function evaluateAssignment(node: AssignmentExpr, env: env): runtimeVal {
  if (node.assigne.kind !== "Identifier") {
    throw new Error(
      `invalid LHS inside assignment expr ${JSON.stringify(node.assigne)}`,
    );
  }
  const varName = (node.assigne as Identifier).symbol;
  return env.assignVar(varName, evaluate(node.value, env));
  // evaluate converts expression to runtimeVal
}

function evaluateVarDeclaration(
  declaration: varDeclaration,
  env: env,
): runtimeVal {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : makeNull();
  return env.declareVar(declaration.identifier, value, declaration.constant);
}

function evaluateFunctionDeclaration(declaration: FunctionDeclaration, env: env): runtimeVal {
  const fn = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  } as FunctionValue;

  return env.declareVar(declaration.name, fn, true);
}

function evaluateReturnStatement(stmt: ReturnStatement, env: env): runtimeVal {
  const value = stmt.value ? evaluate(stmt.value, env) : makeNull();
  return { type: "return", value } as ReturnVal;
}

function evaluateIfStatement(stmt: IfStatement, env: env): runtimeVal {
  const condition = evaluate(stmt.condition, env);
  const isTrue = condition.type === "boolean" ? (condition as booleanVal).value : true;

  if (isTrue) {
    const scope = new Environment(env);
    let last: runtimeVal = makeNull();
    for (const bodyStmt of stmt.body) {
      last = evaluate(bodyStmt, scope);
      if (last.type === "return") return last;
    }
    return last;
  } else if (stmt.alternate) {
    if (Array.isArray(stmt.alternate)) {
      const scope = new Environment(env);
      let last: runtimeVal = makeNull();
      for (const bodyStmt of stmt.alternate) {
        last = evaluate(bodyStmt, scope);
        if (last.type === "return") return last;
      }
      return last;
    } else {
      return evaluateIfStatement(stmt.alternate as IfStatement, env);
    }
  }
  return makeNull();
}

function evaluateWhileStatement(stmt: WhileStatement, env: env): runtimeVal {
  let last: runtimeVal = makeNull();
  while (true) {
    const condition = evaluate(stmt.condition, env);
    const isTrue = condition.type === "boolean" ? (condition as booleanVal).value : true;
    if (!isTrue) break;
    
    const scope = new Environment(env);
    for (const bodyStmt of stmt.body) {
      last = evaluate(bodyStmt, scope);
      if (last.type === "return") return last; // Bubble up
    }
  }
  return last;
}

function evaluateForStatement(stmt: ForStatement, env: env): runtimeVal {
  let last: runtimeVal = makeNull();
  const loopScope = new Environment(env);
  
  evaluate(stmt.init, loopScope);

  while (true) {
    const condition = evaluate(stmt.condition, loopScope);
    const isTrue = condition.type === "boolean" ? (condition as booleanVal).value : true;
    if (!isTrue) break;
    
    const bodyScope = new Environment(loopScope);
    for (const bodyStmt of stmt.body) {
      last = evaluate(bodyStmt, bodyScope);
      if (last.type === "return") return last; // Bubble up
    }

    evaluate(stmt.update, loopScope);
  }
  return last;
}

function evaluateArrayLiteral(node: ArrayLiteral, env: env): runtimeVal {
    const elements = node.elements.map(el => evaluate(el, env));
    return { type: "array", elements } as ArrayVal;
}

function evaluateObject(obj: ObjectLiteral, env: env): runtimeVal {
    const object = {type:"object" , properties:{}} as ObjectVal;
    for(const {key,value} of obj.properties){
        // handles valid key:pair
        const runtimeVal = (value==undefined) ? env.lookVar(key) : evaluate(value,env);
        object.properties[key] = runtimeVal;
    }
    return object;
}

function evaluateCallExpr(expr:CallExpr , env:env):runtimeVal{
  const args = expr.args.map((arg)=>evaluate(arg,env));
  const fn = evaluate(expr.caller , env);

  if(fn.type == "native-fn"){
    const result = (fn as NativeFnValue).call(args,env);
    return result;
  }

  if (fn.type == "function") {
    const func = fn as FunctionValue;
    const scope = new Environment(func.declarationEnv);

    if (args.length !== func.parameters.length) {
      throw new Error(
        `Arity mismatch: Function '${func.name}' expects ${func.parameters.length} arguments, but got ${args.length}.`,
      );
    }

    // Create variables for the arguments
    for (let i = 0; i < func.parameters.length; i++) {
        const varname = func.parameters[i];
        scope.declareVar(varname, args[i], false);
    }

    let result: runtimeVal = makeNull();
    // Evaluate the function body
    for (const stmt of func.body) {
        result = evaluate(stmt, scope);
        if (result.type === "return") {
            return (result as ReturnVal).value;
        }
    }

    return result;
  }

  throw new Error(`Cannot call a value that is not a function ${JSON.stringify(fn)}`);
}

export function evaluate(astNode: Stmt, env: env): runtimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;

    case "NullLiteral":
      return makeNull();
    case "Identifier":
      return evaluateIdentifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return evaluateObject(astNode as ObjectLiteral, env);
    case "CallExpr":
      return evaluateCallExpr(astNode as CallExpr , env);
    case "BinaryExp":
      return evaluateBinaryExp(astNode as BinaryExp, env);
    case "AssignmentExpr":
      return evaluateAssignment(astNode as AssignmentExpr, env);
    case "Program":
      return evaluateProgram(astNode as Program, env);
    case "varDeclaration":
      return evaluateVarDeclaration(astNode as varDeclaration, env);
    case "FunctionDeclaration":
      return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env);
    case "ReturnStatement":
      return evaluateReturnStatement(astNode as ReturnStatement, env);
    case "IfStatement":
      return evaluateIfStatement(astNode as IfStatement, env);
    case "WhileStatement":
      return evaluateWhileStatement(astNode as WhileStatement, env);
    case "ForStatement":
      return evaluateForStatement(astNode as ForStatement, env);
    case "ArrayLiteral":
      return evaluateArrayLiteral(astNode as ArrayLiteral, env);
    default:
      throw new Error(
        `This AST node has not been set for interpretation! ${JSON.stringify(astNode)}`,
      );
  }
}
