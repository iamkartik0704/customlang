import { Token,tokenize,Tokentype } from "./lexer";
import { Expr,BinaryExp,NumericLiteral,Identifier,Program,Stmt } from "./ast";

export default class Parser{
    private tokens:Token[] = [];

    private notEOF():boolean{
        return this.tokens[0].type!=Tokentype.EOF;
    }
    private parseSMT():Stmt{
        // since we dont have different statments rn{program is a statement rest all the 3 are expressions}
        return this.parseExp();
    }
    private parseExp():Expr{
        return this.parsePAdditiveExpr();
    }
    private expect(type:Tokentype , err :any){
        const prev = this.tokens.shift() as Token;
        if(!prev || prev.type !== type){
            throw new Error(`Parser Error: ${err}\nExpected: ${type}\nReceived: ${JSON.stringify(prev)}`);
        }
        return prev;
    }
    
    // (10+5) - 5
    private parsePAdditiveExpr():Expr{
        let left = this.parseMultiplicativeExpr();
        // calling this for precedence

        while(this.at().value == "+" || this.at().value == "-"){
            const operator = this.eat().value;
            const right = this.parseMultiplicativeExpr();
            
            left = {
                kind:"BinaryExp",
                left,
                right,
                operator,
            } as BinaryExp
        }
        return left;
    }
    private parseMultiplicativeExpr():Expr{
        let left = this.parsePrimaryExpr();

        while(this.at().value == "*" || this.at().value == "/"|| this.at().value == "%"){
            const operator = this.eat().value;
            const right = this.parsePrimaryExpr();
            
            left = {
                kind:"BinaryExp",
                left,
                right,
                operator,
            } as BinaryExp
        }
        return left;
    }

    private parsePrimaryExpr():Expr{
        const tk = this.at().type;

        switch (tk) {
            case Tokentype.Identifier:
                return {kind:"Identifier" , symbol:this.eat().value} as Identifier;

            case Tokentype.Number:
                return {kind:"NumericLiteral" , value:parseFloat(this.eat().value)} as NumericLiteral;
                // parseFloat provides the support for floating numbers as well
                
            case Tokentype.OpenParens:{
                this.eat()    // for opening param
                const value = this.parseExp();
                this.expect(Tokentype.CloseParens , "unexpected token found inside the parenthesised  expression. Expected closing parenthesis")   // for closing param
                return value;
            }
        
            default:
                throw new Error(`unexpected token type encountered while parsing: ${JSON.stringify(this.at())}`)

        }
    }

    private at(){
        return this.tokens[0] as Token;
    }
    // now we have the ability to get to the current and the next advance token
    private eat(){
        return this.tokens.shift() as Token;
    }

    public produceAST(sourceCode:string):Program{
        this.tokens = tokenize(sourceCode);
        const program : Program = {
            kind:"Program",
            body:[],
        };

        // parse till end of file
        while(this.notEOF()){
            program.body.push(this.parseSMT());
        }
        return program;
    }
}

// order of precedence:
/*

>>> highest one to be paresed at the last


primaryExpr
unary
multiplicative
additive
comparison
logical
functionCall
memberExpr
assignmentExpr
*/