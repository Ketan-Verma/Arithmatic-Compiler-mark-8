// ...existing code...
document
  .querySelector(".chat-container button")
  .addEventListener("click", async function () {
    const inputValue = document.querySelector(".chat-container input").value;

    try {
      // Clear previous outputs
      document.querySelector(".lex-process").innerHTML = "";
      document.querySelector(".parse-process").innerHTML = "";

      // Run lexer
      const tokens = await lexer(inputValue);

      // Show lexer success message
      const lexSuccess = document.createElement("div");
      lexSuccess.innerHTML = `
        <p style="color: #4caf50; background-color: #e8f5e9; padding: 10px; border-left: 3px solid #4caf50; margin-top: 10px;">
          ✅ Lexical Analysis Complete: ${tokens.length - 1} tokens found
        </p>
      `;
      document.querySelector(".lex-process").appendChild(lexSuccess);

      // Run parser
      await parse(tokens);

      // Show parser success message
      const parseSuccess = document.createElement("div");
      parseSuccess.innerHTML = `
        <p style="color: #4caf50; background-color: #e8f5e9; padding: 10px; border-left: 3px solid #4caf50; margin-top: 10px;">
          ✅ Syntax Analysis Complete: Expression is valid
        </p>
      `;
      document.querySelector(".parse-process").appendChild(parseSuccess);
    } catch (error) {
      console.error("Error:", error.message);

      // Format error message
      const errorDisplay = document.createElement("div");
      errorDisplay.innerHTML = `
        <p style="color: #f44336; background-color: #ffebee; padding: 10px; border-left: 3px solid #f44336; margin-top: 10px;">
          ❌ Error: ${error.message}
          <br>Compilation stopped.
        </p>
      `;

      // Add error message to the appropriate section with animation
      if (error.message.includes("Unrecognized character")) {
        errorDisplay.style.animation = "fadeInUp 0.5s ease forwards";
        document.querySelector(".lex-process").appendChild(errorDisplay);
      } else {
        errorDisplay.style.animation = "fadeInUp 0.5s ease forwards";
        document.querySelector(".parse-process").appendChild(errorDisplay);
      }

      // Disable and shake run button temporarily
      const runButton = document.querySelector(".chat-container button");
      runButton.disabled = true;
      runButton.style.animation = "shake 0.5s ease";
      setTimeout(() => {
        runButton.disabled = false;
        runButton.style.animation = "";
      }, 1000);
    }
  });

// Add shake animation to style.css if not already present
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);
// ...existing code...
