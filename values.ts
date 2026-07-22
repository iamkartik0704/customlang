import env from "./env"
import { Stmt } from "./ast";
export type ValueType = "null" | "number" | "string" | "boolean" | "object" |"native-fn" | "function" | "return" | "array";

export interface runtimeVal{
    type:ValueType;
}

export interface NullVal extends runtimeVal{
    type:"null";
    value:null;
}

export interface NumberVal extends runtimeVal{
    type:"number";
    value:number;
}

export function makeNumber(n=0){
    return {type:"number" , value:n} as NumberVal;
}

export interface StringVal extends runtimeVal{
    type:"string";
    value:string;
}

export function makeString(s=""){
    return {type:"string" , value:s} as StringVal;
}

export interface booleanVal extends runtimeVal{
    type:"boolean";
    value:boolean;
}

export function makeBoolean(b=true){
    return {type:"boolean" , value:b} as booleanVal;
}

export function makeNull(){
    return {type:"null" , value:null} as NullVal;
}

export interface ObjectVal extends runtimeVal{
    type:"object";
    properties:Record<string,runtimeVal>;
}
export type functionCall = (args:runtimeVal[] , env:env)=>runtimeVal;

export interface NativeFnValue extends runtimeVal{
    type:"native-fn";
    call:functionCall;
}

export function makeNativeFn(call:functionCall){
    return {type:"native-fn" , call} as NativeFnValue;
}

export interface FunctionValue extends runtimeVal{
    type:"function";
    name:string;
    parameters:string[];
    declarationEnv:env;
    body:Stmt[];
}

export interface ReturnVal extends runtimeVal {
    type: "return";
    value: runtimeVal;
}

export interface ArrayVal extends runtimeVal {
    type: "array";
    elements: runtimeVal[];
}