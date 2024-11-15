const PARSE_SPEED = 100;

// Grammar rules representation
const GRAMMAR = {
  E: [["T", "E'"]],
  "E'": [["+", "T", "E'"], ["-", "T", "E'"], ["ε"]],
  T: [["F", "T'"]],
  "T'": [["*", "F", "T'"], ["/", "F", "T'"], ["ε"]],
  F: [["(", "E", ")"], ["NUMBER"]],
};

// Parsing table
const PARSING_TABLE = {
  E: {
    NUMBER: ["T", "E'"],
    LPAREN: ["T", "E'"],
  },
  "E'": {
    PLUS: ["+", "T", "E'"],
    MINUS: ["-", "T", "E'"],
    RPAREN: ["ε"],
    EOF: ["ε"],
  },
  T: {
    NUMBER: ["F", "T'"],
    LPAREN: ["F", "T'"],
  },
  "T'": {
    PLUS: ["ε"],
    MINUS: ["ε"],
    MULTIPLY: ["*", "F", "T'"],
    DIVIDE: ["/", "F", "T'"],
    RPAREN: ["ε"],
    EOF: ["ε"],
  },
  F: {
    NUMBER: ["NUMBER"],
    LPAREN: ["(", "E", ")"],
  },
};

async function visualizeParseStep(
  stepNumber,
  stack,
  top,
  lookAhead,
  description,
  isLastStep = false,
  isError = false
) {
  const parseOutput = document.querySelector(".parse-process");
  const row = document.createElement("div");

  // Add animation delay for smoother appearance
  const style = `
    ${
      isLastStep
        ? isError
          ? "background-color: #ffebee; border-left: 3px solid #f44336;"
          : "background-color: #e8f5e9; border-left: 3px solid #4caf50;"
        : ""
    }
    animation-delay: ${50}ms;
  `;

  row.innerHTML = `
        <p style="${style}">Step ${stepNumber}:
           <br>Stack Top: ${top}
           <br>Look Ahead: ${lookAhead.value || lookAhead.type}
           <br>Stack: ${stack.join(" ")}
           <br>Description: ${description}</p>
    `;
  parseOutput.appendChild(row);

  // Auto scroll to the new element
  row.scrollIntoView({ behavior: "smooth", block: "end" });

  await new Promise((resolve) => setTimeout(resolve, PARSE_SPEED));
}

async function parse(tokens) {
  const stack = ["$", "E"];
  let currentToken = 0;
  let stepNumber = 1;

  // Clear previous parse output and show initial input
  const parseOutput = document.querySelector(".parse-process");
  parseOutput.innerHTML = `
    <h3>Parsing Steps:</h3>
    <p>Input String: ${tokens.map((t) => t.value || t.type).join(" ")}</p>
  `;

  try {
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      const currentSymbol = tokens[currentToken];

      let description = "";

      if (top === "$" && currentSymbol.type === "EOF") {
        description = "Success! Both stack top and input are $";
        await visualizeParseStep(
          stepNumber++,
          stack,
          top,
          currentSymbol,
          description,
          true,
          false
        );
        return true;
      }

      if (top === "ε") {
        description = "Pop ε from stack";
        await visualizeParseStep(
          stepNumber++,
          stack,
          top,
          currentSymbol,
          description
        );
        stack.pop();
        continue;
      }

      if (isTerminal(top)) {
        if (matchesTerminal(top, currentSymbol)) {
          description = `Match: ${top} = ${currentSymbol.type}. Pop stack and advance input`;
          await visualizeParseStep(
            stepNumber++,
            stack,
            top,
            currentSymbol,
            description
          );
          stack.pop();
          currentToken++;
        } else {
          description = `Error: Expected ${top}, got ${currentSymbol.type}`;
          await visualizeParseStep(
            stepNumber++,
            stack,
            top,
            currentSymbol,
            description,
            true,
            true
          );
          throw new Error(description);
        }
      } else {
        const production = PARSING_TABLE[top]?.[currentSymbol.type];
        if (production) {
          description = `M[${top},${
            currentSymbol.type
          }] = ${top} → ${production.join(" ")}`;
          await visualizeParseStep(
            stepNumber++,
            stack,
            top,
            currentSymbol,
            description
          );

          stack.pop();
          for (let i = production.length - 1; i >= 0; i--) {
            stack.push(production[i]);
          }

          description = `New stack after pushing production in reverse: ${stack.join(
            " "
          )}`;
          await visualizeParseStep(
            stepNumber++,
            stack,
            top,
            currentSymbol,
            description
          );
        } else {
          description = `Error: No production in M[${top},${currentSymbol.type}]`;
          await visualizeParseStep(
            stepNumber++,
            stack,
            top,
            currentSymbol,
            description,
            true,
            true
          );
          throw new Error(description);
        }
      }
    }
    return false;
  } catch (error) {
    // Ensure error styling is applied even if there's an exception
    const errorStep = document.querySelector(".parse-process p:last-child");
    if (errorStep) {
      errorStep.style.backgroundColor = "#ffebee";
      errorStep.style.borderLeft = "3px solid #f44336";
    }
    throw error;
  }
}

function isTerminal(symbol) {
  return !GRAMMAR.hasOwnProperty(symbol);
}

function matchesTerminal(terminal, token) {
  if (terminal === "NUMBER") return token.type === "NUMBER";
  if (terminal === "+") return token.type === "PLUS";
  if (terminal === "-") return token.type === "MINUS";
  if (terminal === "*") return token.type === "MULTIPLY";
  if (terminal === "/") return token.type === "DIVIDE";
  if (terminal === "(") return token.type === "LPAREN";
  if (terminal === ")") return token.type === "RPAREN";
  return false;
}
