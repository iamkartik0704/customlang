import { runtimeVal } from "./values";

export default class env {
    private parent?: env;
    // here ? means that this can be undefined as well

    // 1. Swapped Map for a standard Record (Object)
    private variables: Record<string, runtimeVal>;

    constructor(parentENV?: env) {
        this.parent = parentENV;
        // 2. Initialized as an empty object
        this.variables = {};
    }

    // declaring a variable
    public declareVar(varName: string, value: runtimeVal): runtimeVal {
        // 3. Swapped .has() for .hasOwnProperty()
        // hasOwnProperty safely checks if the key exists directly on this scope
        if (this.variables.hasOwnProperty(varName)) {
            throw new Error(`Can't declare variable ${varName} as it has already been declared`);
        }
        
        // 4. Swapped .set() for standard bracket notation
        this.variables[varName] = value;
        return value;
    }

    // providing scope to the variable
    public resolve(varName: string): env {
        if (this.variables.hasOwnProperty(varName)) return this;
        
        if (this.parent == undefined) {
            throw new Error(`Can't resolve ${varName} as it does not exist`);
        }
        
        return this.parent.resolve(varName);
    }

    // assigning a value to the variable
    public assignVar(varName: string, value: runtimeVal): runtimeVal {
        const env = this.resolve(varName);
        env.variables[varName] = value;
        return value;
    }

    // looking up for a variable
    public lookVar(varName: string): runtimeVal {
        const env = this.resolve(varName);
        // 5. Swapped .get() for bracket notation
        // Bonus: TypeScript automatically knows this is a runtimeVal, so no 'as' cast is needed!
        return env.variables[varName];
    }
}