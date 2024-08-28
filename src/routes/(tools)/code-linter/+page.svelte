<script>
  import jsBeautify from "js-beautify";
  import { format as sqlFormatter } from "sql-formatter";
  import jsonBeautify from "json-beautify";

  let input = "";
  let output = "";
  let error = "";
  let language = "json";
  let indentWidth = 2;
  let columnLimit = 80;
  let codingStyle = "LLVM";

  const formatters = {
    json: (code) => jsonBeautify(JSON.parse(code), null, indentWidth),
    javascript: (code) => {
      try {
        return jsBeautify.js(code, {
          indent_size: indentWidth,
          max_preserve_newlines: columnLimit,
        });
      } catch (err) {
        throw new Error(`Invalid JavaScript: ${err.message}`);
      }
    },
    html: (code) =>
      jsBeautify.html(code, {
        indent_size: indentWidth,
        max_preserve_newlines: columnLimit,
      }),
    css: (code) =>
      jsBeautify.css(code, {
        indent_size: indentWidth,
        max_preserve_newlines: columnLimit,
      }),
    sql: (code) => sqlFormatter(code, { indent: " ".repeat(indentWidth) }),
    python: (code) => {
      try {
        // Example of adding indentation and handling basic formatting
        const formattedCode = code
          .split("\n")
          .map((line, index) => {
            if (line.trim() === "") {
              return ""; // Skip empty lines
            }
            let indent = " ".repeat(indentWidth * index); // Adjust indentation based on line number or depth logic
            return indent + line.trim();
          })
          .join("\n");
        return formattedCode;
      } catch (err) {
        throw new Error(`Invalid Python: ${err.message}`);
      }
    },

    java: (code) => {
      try {
        return jsBeautify.js(code, {
          indent_size: indentWidth,
          max_preserve_newlines: columnLimit,
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    c: (code) => {
      try {
        return jsBeautify.js(code, {
          indent_size: indentWidth,
          max_preserve_newlines: columnLimit,
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    cpp: (code) => {
      try {
        return jsBeautify.js(code, {
          indent_size: indentWidth,
          max_preserve_newlines: columnLimit,
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
  };

  function formatCode() {
    try {
      output = formatters[language](input);
      error = "";
    } catch (err) {
      error = `Invalid ${language.toUpperCase()}: ${err.message}`;
      output = "";
    }
  }

  function copyToClipboard() {
    if (output) {
      navigator.clipboard
        .writeText(output)
        .then(() => {
          console.log("Copied to clipboard successfully!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    } else {
      console.error("No formatted code to copy.");
    }
  }

  function downloadCode() {
    if (output) {
      const blob = new Blob([output], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `formatted.${language}`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      console.error("No formatted code to download.");
    }
  }

  function handleInputChange(event) {
    input = event.target.value;
  }

  function handleLanguageChange(event) {
    language = event.target.value;
    input = "";
    output = "";
  }

  function handleIndentWidthChange(event) {
    indentWidth = parseInt(event.target.value) || 2;
  }

  function handleColumnLimitChange(event) {
    columnLimit = parseInt(event.target.value) || 80;
  }

  function handleCodingStyleChange(event) {
    codingStyle = event.target.value;
  }
</script>

<div class="container">
  <div class="format-options">
    <div>
      <label>Language</label>
      <select on:change={handleLanguageChange}>
        <option value="json">JSON</option>
        <option value="javascript">JavaScript</option>
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="sql">SQL</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="c">C</option>
        <option value="cpp">C++</option>
      </select>
    </div>
    <div>
      <label>Coding Style:</label>
      <select on:change={handleCodingStyleChange}>
        <option value="LLVM">LLVM</option>
        <option value="GOOGLE">Google</option>
        <option value="WEBKIT">WebKit</option>
        <option value="MOZILLA">Mozilla</option>
        <option value="CHROMIUM">Chromium</option>
      </select>
    </div>
    <div>
      <label>Indent Width:</label>
      <input
        type="number"
        value={indentWidth}
        on:input={handleIndentWidthChange}
      />
    </div>
    <div>
      <label>Column Limit:</label>
      <input
        type="number"
        value={columnLimit}
        on:input={handleColumnLimitChange}
      />
    </div>
  </div>
  <div class="input-output">
    <div class="input-area">
      <label>Input Code</label>
      <textarea
        bind:value={input}
        rows="30"
        placeholder="Enter code here..."
        on:input={handleInputChange}
      ></textarea>
    </div>
    <div class="output-area">
      <label>Formatted Code</label>
      <textarea bind:value={output} rows="30" readonly></textarea>
      {#if error}
        <div class="error">{error}</div>
      {/if}
    </div>
  </div>
  <div class="buttons">
    <button on:click={copyToClipboard} disabled={!output}
      >Copy to Clipboard</button
    >
    <button on:click={formatCode}>Format</button>
    <button on:click={downloadCode} disabled={!output}>Download Code</button>
  </div>
</div>

<style>
  .container {
    max-width: 1300px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
    font-weight: 700;
    color: rgba(137, 135, 135, 0.986);
    border-radius: 8px;
    border: 3px solid #7f7878;
  }
  .input-output {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .input-area,
  .output-area {
    flex: 1;
    margin: 0 10px;
  }
  textarea {
    width: 100%;
    height: 500px;
    padding: 10px;
    border: 3px solid #5a5957;
    border-radius: 4px;
    font-family: monospace;
    background-color: transparent;
  }
  .format-options {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
  }
  .buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
  }
  button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: rgb(174, 167, 167);
    cursor: pointer;
  }
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  .error {
    color: red;
    margin-top: 10px;
  }
  label {
    margin-right: 10px;
  }
  input[type="number"] {
    width: 60px;
    padding: 5px;
    margin-left: 5px;
  }
</style>
