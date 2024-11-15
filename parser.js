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

// ...existing code...

function drawParseTree(parseTree, canvasId) {
  const container = document.getElementById(canvasId).parentElement;
  container.innerHTML = ""; // Clear previous content

  // Set up SVG
  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

  // Create D3 tree layout
  const treeLayout = d3
    .tree()
    .size([
      width - margin.left - margin.right,
      height - margin.top - margin.bottom,
    ]);

  // Convert parse tree to D3 hierarchy
  const root = d3.hierarchy(parseTree);
  const treeData = treeLayout(root);

  // Draw links
  svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .selectAll("path")
    .data(treeData.links())
    .join("path")
    .attr(
      "d",
      d3
        .linkVertical()
        .x((d) => d.x)
        .y((d) => d.y)
    )
    .attr("fill", "none")
    .attr("stroke", "#569cd6")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0)
    .transition()
    .duration(500)
    .attr("opacity", 1);

  // Draw nodes
  const nodes = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .selectAll("g")
    .data(treeData.descendants())
    .join("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  // Add circles for nodes
  nodes
    .append("circle")
    .attr("r", 20)
    .attr("fill", "#2d2d2d")
    .attr("stroke", "#569cd6")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0)
    .transition()
    .duration(500)
    .attr("opacity", 1);

  // Add text labels
  nodes
    .append("text")
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill", "#d4d4d4")
    .style("font-family", "Consolas")
    .style("font-size", "14px")
    .text((d) => getAbbreviatedSymbol(d.data.symbol))
    .attr("opacity", 0)
    .transition()
    .duration(500)
    .attr("opacity", 1);

  // Add hover effects
  nodes
    .on("mouseover", function () {
      d3.select(this)
        .select("circle")
        .transition()
        .duration(200)
        .attr("r", 25)
        .attr("fill", "#3c3c3c");
    })
    .on("mouseout", function () {
      d3.select(this)
        .select("circle")
        .transition()
        .duration(200)
        .attr("r", 20)
        .attr("fill", "#2d2d2d");
    });
}

// Remove these functions as they're no longer needed
// calculateNodePositions()
// drawNodes()
// drawConnections()
// getTreeDimensions()

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
