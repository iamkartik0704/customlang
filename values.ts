import env from "./env"
export type ValueType = "null" | "number" | "boolean" | "object" |"native-fn";

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