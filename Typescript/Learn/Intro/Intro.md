TypeScript is a programming language that builds on JavaScript by adding static types.

It essentially acts as a superset of JavaScript, meaning that all valid JavaScript code is also valid TypeScript code.

The key addition of static typing allows developers to define the expected data types of variables, function parameters, and return values, which helps catch errors during developement and improves code maintainability.

Main points:-
    - It compiles to JavaScript. Browsers and Node can't run TypeScript as is. The compiler checks the types and then remove them, leaving plain JS.
    - Types only exist while you write and build the code. They catch bugs before the code runs, but they disappear from the output, so they add no runtime cost and do no runtime checks.
    - Types are inferred.
    - Types are structural. Two types are compatible if they have the same shape, whatever they're named: 
        interface User { id: number, name: string }
        const u: User = { id: 1, name: "Ana} // works with any object of this shape
    - The type system goes well beyond basics. It has:-
        - Unions ( string | null)
        - Generics ( Array <T> )
        - Literal types ( "GET" | "POST" )
        - Utility type ( Partial <T>, Pick <T>)
        - and more


Why Frontend developers use it:-
    - Your editor can autocomplete, jump to definitions and rename things safely
    - It catches types, missing props and undefined access before you ship
    - It acts as documentation: a React component's props type tells you how to use it.
    - Large codebases are easier to refactor