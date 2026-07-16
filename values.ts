export type ValueType = "null" | "number" | "boolean" | "object";

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