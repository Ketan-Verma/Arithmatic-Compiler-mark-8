const CLOCK_SPEED = 250; // 500ms between operations

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  toString() {
    return `${this.type}: ${this.value}`;
  }
}

const TokenType = {
  NUMBER: "NUMBER",
  PLUS: "PLUS",
  MINUS: "MINUS",
  MULTIPLY: "MULTIPLY",
  DIVIDE: "DIVIDE",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  EOF: "EOF",
};

async function lexer(input) {
  let tokens = [];
  let i = 0;

  // Create and insert table
  const lexOutput = document.querySelector(".lex-process");
  lexOutput.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Token Type</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;
  const tbody = lexOutput.querySelector("tbody");

  while (i < input.length) {
    let char = input[i];
    let newToken = null;
    if (/\d/.test(char)) {
      let num = char;
      while (/\d/.test(input[i + 1])) {
        num += input[++i];
      }
      newToken = new Token(TokenType.NUMBER, num);
      tokens.push(newToken);
    } else if (char === "+") {
      newToken = new Token(TokenType.PLUS, char);
      tokens.push(newToken);
    } else if (char === "-") {
      newToken = new Token(TokenType.MINUS, char);
      tokens.push(newToken);
    } else if (char === "*") {
      newToken = new Token(TokenType.MULTIPLY, char);
      tokens.push(newToken);
    } else if (char === "/") {
      newToken = new Token(TokenType.DIVIDE, char);
      tokens.push(newToken);
    } else if (char === "(") {
      newToken = new Token(TokenType.LPAREN, char);
      tokens.push(newToken);
    } else if (char === ")") {
      newToken = new Token(TokenType.RPAREN, char);
      tokens.push(newToken);
    } else if (/\s/.test(char)) {
      // Ignore whitespace
    } else {
      // Add new row to table
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>invalid token</td>
        <td>${char}</td>
      `;
      tbody.appendChild(row);
      throw new Error(`Unrecognized character '${char}' at position ${i}`);
    }
    if (newToken) {
      await sleep(CLOCK_SPEED);
      console.log(newToken);

      // Add new row to table
      const row = document.createElement("tr");
      row.style.animationDelay = `${50}ms`; // Add slight delay for smoother appearance
      row.innerHTML = `
        <td>${newToken.type}</td>
        <td>${newToken.value}</td>
      `;
      tbody.appendChild(row);

      // Auto scroll to the new row
      row.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    i++;
  }
  //Add message to after table

  // Add EOF token to table
  const eofToken = new Token(TokenType.EOF, "$");
  tokens.push(eofToken);
  const row = document.createElement("tr");
  row.innerHTML = `
      <td>End Of Token</td>
      <td>$</td>
    `;
  tbody.appendChild(row);

  return tokens;
}
