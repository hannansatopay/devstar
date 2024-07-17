<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SQL Converter</title>
    <style>
        body {
            background-color: #f4f7fc;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            color: #333;
        }
        .navbar .navbar-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 14px 20px;
        }
        .navbar a {
            color: white;
            text-align: center;
            padding: 14px 20px;
            text-decoration: none;
            font-size: 17px;
        }
        .container {
            text-align: center;
            background: #fff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            width: 100%;
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            color: #3a3a3a;
        }
        p {
            font-size: 1.2em;
            color: #6c757d;
            margin-bottom: 20px;
        }
        .upload-box {
            background-color: #f9f9f9;
            border: 2px dashed #d1d8e0;
            border-radius: 10px;
            padding: 40px;
            cursor: pointer;
            transition: background-color 0.3s, border-color 0.3s;
            margin: 0 auto;
            width: 100%;
        }
        .upload-box.dragover {
            background-color: #e9f4ff;
            border-color: #007bff;
        }
        .upload-box input[type="file"] {
            display: none;
        }
        .upload-box p {
            margin: 0;
            color: #007bff;
        }
        .buttons {
            margin-top: 20px;
        }
        .buttons button {
            padding: 10px 20px;
            margin: 5px;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 5px;
            color: white;
        }
        .csv-btn {
            background-color: #4CAF50;
        }
        .excel-btn {
            background-color: #2196F3;
        }
        .mysql-btn {
            background-color: #FF9800;
        }
        .sqlite-btn {
            background-color: #9C27B0;
        }   
         
</style>
</head>
<body>
        <header class="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div class="max-w-8xl mx-auto flex justify-between items-center px-3 py-3">
                <nav class="w-full flex justify-between items-center">
                    <div class="flex items-center">
                        <a href="/" class="self-center whitespace-nowrap text-xl font-semibold dark:text-white" aria-label="Devstar Home">
                            &lt;/Dev&gt;star
                        </a>
                    </div>
                    <div class="flex items-center">
                        <a href="https://github.com/hannansatopay/devstar" target="_blank" class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 mr-1" aria-label="GitHub Repository">
                            <svg class="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                                <path fill="currentColor" d="..."></path>
                            </svg>
                        </a>
                    </div>
                </nav>
            </div>
        </header>
        
    <div class="container">
        <h1>Convert SQL</h1>
        <p>with our secure online converter</p>
        <div class="upload-box" id="uploadBox">
            <input type="file" id="fileInput" />
            <p>Drag and drop your SQL file here or click to upload.</p>
        </div>
        <div class="buttons">
            <button class="csv-btn" onclick="convertSQL('csv')">Convert to CSV</button>
            <button class="excel-btn" onclick="convertSQL('xlsx')">Convert to XLSX</button>
            <button class="mysql-btn" onclick="convertSQL('mysql')">Convert to MySQL</button>
            <button class="sqlite-btn" onclick="convertSQL('sqlite')">Convert to SQLite</button>
        </div>
    </div>

    <script>
        let sqlContent = '';
        const uploadBox = document.getElementById('uploadBox');
        const fileInput = document.getElementById('fileInput');

        uploadBox.addEventListener('click', () => {
            fileInput.click();
        });

        uploadBox.addEventListener('dragover', (event) => {
            event.preventDefault();
            uploadBox.classList.add('dragover');
        });

        uploadBox.addEventListener('dragleave', () => {
            uploadBox.classList.remove('dragover');
        });

        uploadBox.addEventListener('drop', (event) => {
            event.preventDefault();
            uploadBox.classList.remove('dragover');
            const file = event.dataTransfer.files[0];
            fileInput.files = event.dataTransfer.files;
            processFile(file);
        });

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            processFile(file);
        });

        const processFile = (file) => {
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    sqlContent = event.target.result;
                };
                reader.readAsText(file);
            } else {
                alert("Please select a file.");
            }
        };

        const convertSQL = (format) => {
            if (sqlContent) {
                const data = extractDataFromSQL(sqlContent);
                generateOutput(data, format);
            } else {
                alert("Please upload a SQL file first.");
            }
        };

        const extractDataFromSQL = (content) => {
            const data = [];
            const lines = content.split('\n');
            let headers = null;
            let valuesString = "";
            lines.forEach(line => {
                line = line.trim();
                if (line.startsWith('INSERT INTO')) {
                    const headerMatch = line.match(/\(([^)]+)\)/);
                    if (headerMatch) {
                        headers = headerMatch[1].replace(/`/g, '').split(',').map(header => header.trim());
                        if (data.length === 0) {
                            data.push(headers); // Add headers only once
                        }
                    }
                    // Extract the values string after 'VALUES'
                    const valuesPart = line.substring(line.indexOf('VALUES') + 6).trim();
                    if (valuesString) {
                        valuesString += "," + valuesPart;
                    } else {
                        valuesString = valuesPart;
                    }
                } else if (line.endsWith(");")) {
                    valuesString += line;
                } else if (line.startsWith("(") || valuesString) {
                    // Continue appending multi-line values
                    valuesString += " " + line;
                }
            });
            // Process the accumulated valuesString
            const valueSets = valuesString.split(/(?<=\)),\s*(?=\()/);
            valueSets.forEach(valueSet => {
                const values = valueSet.replace(/^\(|\)$/g, '').split(/,\s*(?=(?:[^']*'[^']*')*[^']*$)/).map(value => value.trim().replace(/'/g, ''));
                data.push(values);
            });
            return data;
        };

        const generateOutput = (data, format) => {
            if (format === 'csv') {
                generateCSV(data);
            } else if (format === 'xlsx') {
                generateXLSX(data);
            } else if (format === 'mysql') {
                generateMySQL(data);
            } else if (format === 'sqlite') {
                generateSQLite(data);
            }
        };

        const generateCSV = (data) => {
            const csvContent = data.map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            downloadFile(blob, 'converted.csv');
        };

        const generateXLSX = (data) => {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            XLSX.writeFile(wb, 'converted.xlsx');
        };

        const generateMySQL = (data) => {
            let mysqlContent = '';
            const headers = data[0];
            data.slice(1).forEach(row => {
                const values = row.map(value => `'${value}'`).join(", ");
                mysqlContent += `INSERT INTO table_name (${headers.join(", ")}) VALUES (${values});\n`;
            });
            const blob = new Blob([mysqlContent], { type: 'text/plain;charset=utf-8;' });
            downloadFile(blob, 'converted.sql');
        };

        const generateSQLite = (data) => {
            let sqliteContent = 'BEGIN TRANSACTION;\n';
            const headers = data[0];
            data.slice(1).forEach(row => {
                const values = row.map(value => `'${value}'`).join(", ");
                sqliteContent += `INSERT INTO table_name (${headers.join(", ")}) VALUES (${values});\n`;
            });
            sqliteContent += 'COMMIT;';
            const blob = new Blob([sqliteContent], { type: 'text/plain;charset=utf-8;' });
            downloadFile(blob, 'converted.sqlite');
        };

        const downloadFile = (blob, fileName) => {
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", fileName);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };


        uploadBox.addEventListener('click', () => fileInput.click());
        uploadBox.addEventListener('dragover', handleDragOver);
        uploadBox.addEventListener('dragleave', handleDragLeave);
        uploadBox.addEventListener('drop', handleDrop);
        fileInput.addEventListener('change', handleFileChange);
        
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.2/xlsx.full.min.js"></script>
</body>
</html>
