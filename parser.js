class ParseNode {
  constructor(type, value = "") {
    this.type = type;
    this.value = value;
    this.children = [];
  }

  addChild(node) {
    this.children.push(node);
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
    this.parseOutput = document.querySelector(".parse-process");
    this.parseOutput.innerHTML =
      "<table><thead><tr><th>Step</th><th>Action</th></tr></thead><tbody></tbody></table>";
    this.tbody = this.parseOutput.querySelector("tbody");
    this.step = 1;
  }

  addParseStep(action) {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${this.step++}</td>
            <td>${action}</td>
        `;
    this.tbody.appendChild(row);
  }

  peek() {
    return this.tokens[this.current];
  }

  consume(expectedType) {
    const token = this.peek();
    if (token.type === expectedType) {
      this.current++;
      this.addParseStep(`Consumed ${token.type}: ${token.value}`);
      return token;
    }
    throw new Error(`Expected ${expectedType} but got ${token.type}`);
  }

  // E -> T E'
  parseE() {
    this.addParseStep("Parsing E -> T E'");
    const node = new ParseNode("E");
    node.addChild(this.parseT());
    node.addChild(this.parseEPrime());
    return node;
  }

  // E' -> + T E' | - T E' | ε
  parseEPrime() {
    const node = new ParseNode("E'");
    const token = this.peek();

    if (token.type === TokenType.PLUS || token.type === TokenType.MINUS) {
      this.addParseStep(`Parsing E' -> ${token.type} T E'`);
      node.addChild(new ParseNode("operator", this.consume(token.type).value));
      node.addChild(this.parseT());
      node.addChild(this.parseEPrime());
    } else {
      this.addParseStep("Parsing E' -> ε");
      node.addChild(new ParseNode("ε"));
    }
    return node;
  }

  // T -> F T'
  parseT() {
    this.addParseStep("Parsing T -> F T'");
    const node = new ParseNode("T");
    node.addChild(this.parseF());
    node.addChild(this.parseTPrime());
    return node;
  }

  // T' -> * F T' | / F T' | ε
  parseTPrime() {
    const node = new ParseNode("T'");
    const token = this.peek();

    if (token.type === TokenType.MULTIPLY || token.type === TokenType.DIVIDE) {
      this.addParseStep(`Parsing T' -> ${token.type} F T'`);
      node.addChild(new ParseNode("operator", this.consume(token.type).value));
      node.addChild(this.parseF());
      node.addChild(this.parseTPrime());
    } else {
      this.addParseStep("Parsing T' -> ε");
      node.addChild(new ParseNode("ε"));
    }
    return node;
  }

  // F -> ( E ) | NUMBER
  parseF() {
    const token = this.peek();
    const node = new ParseNode("F");

    if (token.type === TokenType.LPAREN) {
      this.addParseStep("Parsing F -> ( E )");
      node.addChild(
        new ParseNode("paren", this.consume(TokenType.LPAREN).value)
      );
      node.addChild(this.parseE());
      node.addChild(
        new ParseNode("paren", this.consume(TokenType.RPAREN).value)
      );
    } else if (token.type === TokenType.NUMBER) {
      this.addParseStep("Parsing F -> NUMBER");
      node.addChild(
        new ParseNode("number", this.consume(TokenType.NUMBER).value)
      );
    } else {
      throw new Error(`Unexpected token: ${token.type}`);
    }
    return node;
  }
}

function parse(tokens) {
  try {
    const parser = new Parser(tokens);
    const parseTree = parser.parseE();
    if (parser.peek().type !== TokenType.EOF) {
      throw new Error("Expected end of input");
    }
    parser.addParseStep("Parsing completed successfully");
    return parseTree;
  } catch (error) {
    document.querySelector(
      ".parse-process"
    ).innerHTML += `<div class="error">${error.message}</div>`;
    throw error;
  }
}
