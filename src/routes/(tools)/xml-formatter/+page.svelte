<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XML Formatter</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
        }
        .textarea-container {
            position: relative;
            display: flex;
            width: 100%;
            height: 100%;
        }
        .line-numbers {
            position: absolute;
            top: 56px; 
            left: 0;
            width: 50px; 
            height: calc(100% - 22%); 
            border-right: 1px solid #ccc;
            text-align: right;
            padding-right: 10px;
            padding-left: 5px; 
            color: #888;
            overflow: hidden;
            font-family: monospace;
            line-height: 1.5em;
            overflow-y: auto;
        }
        .line-numbers div {
            height: 1.5em; 
            
        }
        textarea {
            width: 100%;
            height: 20rem%;
            padding-left: 60px; 
            font-family: monospace;
            line-height: 1.5em; 
            resize: none;
            overflow-y: auto;
        }
        .copy-button {
            position: absolute;
            top: 10px;
            right: 10px;
            background: transparent;
            border: none;
            cursor: pointer;
            outline: none;
        }
        .copy-button svg {
            width: 24px;
            height: 24px;
            fill: #888;
        }
        .copy-button:hover svg {
            fill: #555;
        }
    </style>
</head>
<body class="bg-gray-400 h-screen w-full">
    <h1 class="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-red-500 text-transparent bg-clip-text">
        XML Formatter
    </h1>
    <div class="flex items-center justify-center h-full">
        <div class="flex flex-col items-start w-full max-w-full p-4 bg-gray-200 rounded-lg shadow-lg">
            <div class="flex flex-col md:flex-row w-full space-y-4 md:space-y-0 md:space-x-4">
                <!-- First Textarea Container -->
                <div class="flex flex-col items-start w-full md:w-1/2 bg-gray-100 rounded-lg p-4 textarea-container">
                    <button class="copy-button" onclick="copyXML('inputXML');" title="Copy Input">
                       <img src="https://cdn-icons-png.flaticon.com/128/54/54702.png" alt="" class="w-5">
                    </button>
                    <div class="line-numbers font-bold" id="inputLineNumbers"></div>
                    <label for="inputXML" class="mb-2 text-sm font-medium text-gray-700">Input XML</label>
                    <textarea id="inputXML" class="w-full min-h-80 p-3 border px-10 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your XML here..." onscroll="syncScroll(this, 'inputLineNumbers')"></textarea>
                </div>

                <!-- Buttons between the Textareas -->
                <div class="flex flex-row md:flex-col justify-center space-x-2 md:space-x-0 md:space-y-2">
					<button class="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onclick="loadXMLFromFile();">Load</button>
                    <button class="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onclick="formatXML();">Format</button>
                    <button class="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onclick="downloadXML();">Download</button>
                    <button class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" onclick="clearXML();">Clear</button>
                    <!-- <button class="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" onclick="copyXML('inputXML');">Copy Input</button>
                    <button class="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" onclick="copyXML('outputXML');">Copy Output</button> -->
                </div>

                <!-- Second Textarea Container -->
                <div class="flex flex-col items-start w-full md:w-1/2 bg-gray-100 rounded-lg p-4 textarea-container">
                    <button class="copy-button" onclick="copyXML('outputXML');" title="Copy Output">
                        <img src="https://cdn-icons-png.flaticon.com/128/54/54702.png" alt="" class="w-5">
                    </button>
                    <div class="line-numbers font-bold" id="outputLineNumbers"></div>
                    <label for="outputXML" class="mb-2 text-sm font-medium text-gray-700">Output XML</label>
                    <textarea id="outputXML" class="w-full min-h-80 p-3 border px-10 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Output will be shown here..." onscroll="syncScroll(this, 'outputLineNumbers')"></textarea>
                </div>
            </div>
        </div>
    </div>
	<input type="file" id="fileInput" accept=".xml, .txt" style="display: none;">

    <script>
        function updateLineNumbers(textarea, lineNumbers) {
            const lines = textarea.value.split('\n').length;
            let numbersHtml = '';
            for (let i = 1; i <= lines; i++) {
                numbersHtml += '<div>' + i + '</div>';
            }
            lineNumbers.innerHTML = numbersHtml;
        }

        function syncScroll(textarea, lineNumbersId) {
            const lineNumbers = document.getElementById(lineNumbersId);
            lineNumbers.scrollTop = textarea.scrollTop;
        }

        const inputXML = document.getElementById('inputXML');
        const inputLineNumbers = document.getElementById('inputLineNumbers');
        inputXML.addEventListener('input', () => updateLineNumbers(inputXML, inputLineNumbers));

        const outputXML = document.getElementById('outputXML');
        const outputLineNumbers = document.getElementById('outputLineNumbers');
        outputXML.addEventListener('input', () => updateLineNumbers(outputXML, outputLineNumbers));

        // Initialize line numbers on page load
        window.addEventListener('load', () => {
            updateLineNumbers(inputXML, inputLineNumbers);
            updateLineNumbers(outputXML, outputLineNumbers);
        });

        
        function formatXml(xml) {
            let formatted = '';
            let reg = /(>)(<)(\/*)/g;
            xml = xml.replace(reg, '$1\r\n$2$3');
            let pad = 0;
            xml.split('\r\n').forEach(function(node) {
                let indent = 0;
                if (node.match(/.+<\/\w[^>]*>$/)) {
                    indent = 0;
                } else if (node.match(/^<\/\w/) && pad !== 0) {
                    pad -= 1;
                } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                    indent = 1;
                } else {
                    indent = 0;
                }

                let padding = '';
                for (let i = 0; i < pad; i++) {
                    padding += '  ';
                }

                formatted += padding + node + '\r\n';
                pad += indent;
            });

            return formatted;
        }

        function formatXML() {
            const inputXMLValue = document.getElementById('inputXML').value;
            const formattedXML = formatXml(inputXMLValue);
            document.getElementById('outputXML').value = formattedXML;
            updateLineNumbers(document.getElementById('outputXML'), document.getElementById('outputLineNumbers'));
        }
        //Function to copy XML content
        function copyXML(textareaId) {
            const textarea = document.getElementById(textareaId);
            textarea.select();
            textarea.setSelectionRange(0, 99999); 
            document.execCommand('copy');
            alert('Copied to clipboard');
        }


		function loadXMLFromFile() {
        const fileInput = document.getElementById('fileInput');

        // Trigger click event on fileInput when Load button is clicked
        fileInput.click();
    }

    // Event listener wehn a file selected
    fileInput.addEventListener('change', function() {
        const file = fileInput.files[0];

        // Check if file is selected and is of valid type (XML or text)
        if (file && (file.type === 'text/xml' || file.type === 'text/plain')) {
            const reader = new FileReader();

            // FileReader onload event to read file content
            reader.onload = function(event) {
                const fileContent = event.target.result;

                // Display file content in inputXML textarea
                document.getElementById('inputXML').value = fileContent;

                // Update line numbers if needed
                updateLineNumbers(document.getElementById('inputXML'), document.getElementById('inputLineNumbers'));
            };

            // Read file as text
            reader.readAsText(file);
        } else {
            alert('Please select a valid XML or text file.');
        }
    });


// Function to download XML content from output textarea
function downloadXML() {
    const outputContent = document.getElementById('outputXML').value;
    if (outputContent.trim() === '') {
        alert('Nothing to download. Output XML is empty.');
        return;
    }
    const blob = new Blob([outputContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to clear both input and output textareas
function clearXML() {
    document.getElementById('inputXML').value = '';
    document.getElementById('outputXML').value = '';
    updateLineNumbers(document.getElementById('inputXML'), document.getElementById('inputLineNumbers'));
    updateLineNumbers(document.getElementById('outputXML'), document.getElementById('outputLineNumbers'));
}


    </script>
	
</body>
</html>