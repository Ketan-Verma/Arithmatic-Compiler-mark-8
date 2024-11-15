const PARSE_SPEED = 500;

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

// Add symbol abbreviation map
const SYMBOL_ABBREVIATIONS = {
  NUMBER: "num",
  PLUS: "+",
  MINUS: "-",
  MULTIPLY: "*",
  DIVIDE: "/",
  LPAREN: "(",
  RPAREN: ")",
  EOF: "$",
};

function getAbbreviatedSymbol(symbol) {
  return SYMBOL_ABBREVIATIONS[symbol] || symbol;
}

async function visualizeParseStep(
  stepNumber,
  stack,
  top,
  lookAhead,
  description,
  parseTree, // Add parseTree parameter
  isLastStep = false,
  isError = false
) {
  const timestamp = new Date().toISOString().split("T")[1].slice(0, -1);
  const parseOutput = document.querySelector(".parse-process");
  const row = document.createElement("div");
  row.classList.add("parse-step");

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
    <div class="parse-text">
      <p style="${style}">
        <span class="timestamp">[${timestamp}]</span> Step ${stepNumber}:
        <br><span class="debug-label">Stack Top:</span> ${getAbbreviatedSymbol(
          top
        )}
        <br><span class="debug-label">Look Ahead:</span> ${getAbbreviatedSymbol(
          lookAhead.type
        )}
        <br><span class="debug-label">Stack:</span> ${stack
          .map(getAbbreviatedSymbol)
          .join(" ")}
        <br><span class="debug-label">Action:</span> ${description}
      </p>
    </div>
    <div class="parse-diagram">
      <canvas id="parseTreeCanvas${stepNumber}" width="400" height="300"></canvas>
    </div>
  `;
  parseOutput.appendChild(row);

  // Draw the parse tree on the canvas
  drawParseTree(parseTree, `parseTreeCanvas${stepNumber}`);

  // Auto scroll to the new element
  row.scrollIntoView({ behavior: "smooth", block: "end" });

  await new Promise((resolve) => setTimeout(resolve, PARSE_SPEED));
}

// Helper function to calculate tree dimensions
function getTreeDimensions(node, depth = 0) {
  if (!node) return { depth, breadth: 0 };
  if (!node.children || node.children.length === 0)
    return { depth: depth + 1, breadth: 1 };

  let maxDepth = depth + 1;
  let totalBreadth = 0;

  for (let child of node.children) {
    let childDims = getTreeDimensions(child, depth + 1);
    maxDepth = Math.max(maxDepth, childDims.depth);
    totalBreadth += childDims.breadth;
  }

  return { depth: maxDepth, breadth: totalBreadth };
}

function drawParseTree(parseTree, canvasId) {
  // Create SVG element
  const container = document.getElementById(canvasId).parentElement;
  container.innerHTML = ""; // Clear previous content

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "600"); // Increased height to accommodate larger gaps
  svg.setAttribute("viewBox", "0 0 800 600"); // Adjusted viewBox
  container.appendChild(svg);

  // Calculate initial positions
  const nodeRadius = 20;
  const levelHeight = 100; // Increased from 60 to 100
  calculateNodePositions(parseTree, 400, 40, 0, 800);

  // Draw connections first (so they appear behind nodes)
  drawConnections(parseTree, svg, nodeRadius);

  // Draw nodes
  drawNodes(parseTree, svg, nodeRadius);
}

function calculateNodePositions(node, x, y, level, width) {
  node.x = x;
  node.y = y;

  if (node.children.length > 0) {
    const childWidth = width / node.children.length;
    let startX = x - width / 2 + childWidth / 2;

    node.children.forEach((child, index) => {
      calculateNodePositions(
        child,
        startX + index * childWidth,
        y + 100, // Increased from 60 to 100
        level + 1,
        childWidth
      );
    });
  }
}

function drawNodes(node, svg, nodeRadius) {
  // Draw node circle
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", node.x);
  circle.setAttribute("cy", node.y);
  circle.setAttribute("r", nodeRadius);
  circle.setAttribute("fill", "#2d2d2d");
  circle.setAttribute("stroke", "#569cd6");
  svg.appendChild(circle);

  // Draw node text
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", node.x);
  text.setAttribute("y", node.y + 5);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", "#d4d4d4");
  text.setAttribute("font-family", "Consolas");
  text.setAttribute("font-size", "14px");
  text.textContent = getAbbreviatedSymbol(node.symbol);
  svg.appendChild(text);

  // Recursively draw children
  node.children.forEach((child) => drawNodes(child, svg, nodeRadius));
}

function drawConnections(node, svg, nodeRadius) {
  node.children.forEach((child) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", node.x);
    line.setAttribute("y1", node.y + nodeRadius);
    line.setAttribute("x2", child.x);
    line.setAttribute("y2", child.y - nodeRadius);
    line.setAttribute("stroke", "#569cd6");
    line.setAttribute("stroke-width", "1.5");
    svg.appendChild(line);

    drawConnections(child, svg, nodeRadius);
  });
}

// Modify parse function to build parseTree and pass it to visualizeParseStep

async function parse(tokens) {
  const stack = ["$", "E"];
  let currentToken = 0;
  let stepNumber = 1;

  // Initialize parse tree with start symbol
  const parseTreeRoot = new ParseTreeNode("E");

  // Stack to keep track of parse tree nodes
  const parseTreeStack = [parseTreeRoot];

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

      const currentNode = parseTreeStack[parseTreeStack.length - 1];

      if (top === "$" && currentSymbol.type === "EOF") {
        description = "Success! Both stack top and input are $";
        await visualizeParseStep(
          stepNumber++,
          stack,
          top,
          currentSymbol,
          description,
          parseTreeRoot,
          true,
          false
        );
        return true;
      }

      if (top === "ε") {
        description = "Pop ε from stack";
        stack.pop();
        parseTreeStack.pop();
        await visualizeParseStep(
          stepNumber++,
          stack,
          top,
          currentSymbol,
          description,
          parseTreeRoot
        );
        continue;
      }

      if (isTerminal(top)) {
        if (matchesTerminal(top, currentSymbol)) {
          description = `Match: ${top} = ${currentSymbol.type}. Pop stack and advance input`;
          stack.pop();
          parseTreeStack.pop();
          currentNode.symbol = top;
          await visualizeParseStep(
            stepNumber++,
            stack,
            top,
            currentSymbol,
            description,
            parseTreeRoot
          );
          currentToken++;
        } else {
          await visualizeParseStep(
            stepNumber++,
            stack,
            top,
            currentSymbol,
            description,
            parseTreeRoot,
            true,
            true
          );
          // Immediately throw error and stop
          throw new Error(
            `Parsing error: Expected ${top}, got ${currentSymbol.type}`
          );
        }
      } else {
        const production = PARSING_TABLE[top]?.[currentSymbol.type];
        if (production) {
          description = `M[${top},${
            currentSymbol.type
          }] = ${top} → ${production.join(" ")}`;
          stack.pop();
          parseTreeStack.pop();

          // Replace non-terminal with production
          let newNodes = production.map((sym) => new ParseTreeNode(sym));
          currentNode.children = newNodes;

          // Push production symbols and corresponding parse tree nodes onto stacks
          for (let i = production.length - 1; i >= 0; i--) {
            stack.push(production[i]);
            parseTreeStack.push(newNodes[i]);
          }

          await visualizeParseStep(
            stepNumber++,
            stack,
            top,
            currentSymbol,
            description,
            parseTreeRoot
          );
        } else {
          await visualizeParseStep(
            stepNumber++,
            stack,
            top,
            currentSymbol,
            description,
            parseTreeRoot,
            true,
            true
          );
          // Immediately throw error and stop
          throw new Error(
            `No production in parsing table for ${top} with ${currentSymbol.type}`
          );
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

// ParseTreeNode class
class ParseTreeNode {
  constructor(symbol) {
    this.symbol = symbol;
    this.children = [];
    this.x = 0;
    this.y = 0;
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
