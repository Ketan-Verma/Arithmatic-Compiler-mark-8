// ...existing code...
document
  .querySelector(".chat-container button")
  .addEventListener("click", async function () {
    const inputValue = document.querySelector(".chat-container input").value;
    console.log(inputValue);
    const tokens = await lexer(inputValue);
    console.log("lexer Output");
    console.table(tokens);
    const parseTree = parse(tokens);
    // Handle the input value as needed
  });
// ...existing code...
