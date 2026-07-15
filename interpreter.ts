import { makeNull, NullVal, NumberVal, runtimeVal , ValueType } from "./values"; 
import {BinaryExp, Identifier, NodeType,NumericLiteral,Program,Stmt} from "./ast";
import env from "./env";

function evaluateProgram(program:Program,env:env):runtimeVal{
    let lastEvaluated : runtimeVal = makeNull();

    for (const statement of program.body){
        lastEvaluated = evaluate(statement,env);
    }
    return lastEvaluated;
}
function evaluateNumericBinaryExpr(lhs:NumberVal , rhs:NumberVal , operator:string):NumberVal{
    let result:number;
    if(operator == "+"){
        result = lhs.value+rhs.value;
    }

    else if(operator == "-"){
        result = lhs.value - rhs.value;
    }

    else if(operator == "*"){
        result = lhs.value * rhs.value;
    }

    else if(operator == "/"){
        if(rhs.value == 0){
            throw new Error(`Division by zero is not allowed`);
        }
        result = lhs.value / rhs.value;
    }
    else if(operator == "%"){
        result = lhs.value % rhs.value;
    }
    else{
        throw new Error(`${operator} operator has not been fed `);
    }

    return {value:result , type:"number"}

}
function evaluateBinaryExp(binop:BinaryExp,env:env):runtimeVal{
    const lhs = evaluate(binop.left,env);
    const rhs = evaluate(binop.right,env);

    if(lhs.type=="number" && rhs.type == "number"){
        return evaluateNumericBinaryExpr(lhs as NumberVal , rhs as NumberVal, binop.operator);
    }
    // if any or both are null
    else{
        return makeNull();
    }
}

function evaluateIdentifier(ident:Identifier , env:env){
    return env.lookVar(ident.symbol);
}

export function evaluate(astNode:Stmt , env:env):runtimeVal{
    switch(astNode.kind){
        case "NumericLiteral":
            return {
                value:((astNode as NumericLiteral).value),
                type: "number",
            } as NumberVal;

        case "NullLiteral":
            return makeNull();
        case "Identifier":
            return evaluateIdentifier(astNode as Identifier , env);
        case "BinaryExp":
            return evaluateBinaryExp(astNode as BinaryExp,env);
        case "Program":
            return evaluateProgram(astNode as Program,env);
        default:
            throw new Error(`This AST node has not been set for interpretation! ${JSON.stringify(astNode)}`);
    }
}