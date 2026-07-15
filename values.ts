export type ValueType = "null" | "number";

export interface runtimeVal{
    type:ValueType;
}

export interface NullVal extends runtimeVal{
    type:"null";
    value:"null";
}

export interface NumberVal extends runtimeVal{
    type:"number";
    value:number;
}