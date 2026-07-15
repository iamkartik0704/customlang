import { NullVal, NumberVal, runtimeVal , ValueType } from "./values"; 
import {BinaryExp, NodeType,NumericLiteral,Program,Stmt} from "./ast";

function evaluateProgram(program:Program):runtimeVal{
    let lastEvaluated : runtimeVal = { type:"null" , value:"null"} as NullVal;

    for (const statement of program.body){
        lastEvaluated = evaluate(statement);
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
function evaluateBinaryExp(binop:BinaryExp):runtimeVal{
    const lhs = evaluate(binop.left);
    const rhs = evaluate(binop.right);

    if(lhs.type=="number" && rhs.type == "number"){
        return evaluateNumericBinaryExpr(lhs as NumberVal , rhs as NumberVal, binop.operator);
    }
    // if any or both are null
    else{
        return {type:"null" , value:"null"} as NullVal;
    }
}

export function evaluate(astNode:Stmt):runtimeVal{
    switch(astNode.kind){
        case "NumericLiteral":
            return {
                value:((astNode as NumericLiteral).value),
                type: "number",
            } as NumberVal;

        case "NullLiteral":
            return {value:"null",type:"null"} as NullVal;
        case "BinaryExp":
            return evaluateBinaryExp(astNode as BinaryExp);

        case "Program":
            return evaluateProgram(astNode as Program);
        default:
            throw new Error(`This AST node has not been set for interpretation! ${JSON.stringify(astNode)}`);
    }
}