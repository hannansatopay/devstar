<script>
    import { onMount } from "svelte";
    import * as XLSX from 'xlsx';

    let sqlContent = '';
    let uploadBox;
    let fileInput;
    let filename='';

    function handleUploadBoxClick() {
        fileInput.click();
    }

    function handleDragOver(event) {
        event.preventDefault();
        uploadBox.classList.add('dragover');
    }

    function handleDragLeave() {
        uploadBox.classList.remove('dragover');
    }

    function handleDrop(event) {
        event.preventDefault();
        uploadBox.classList.remove('dragover');
        const file = event.dataTransfer.files[0];
        fileInput.files = event.dataTransfer.files;
        filename=file.name;
        processFile(file);
    }

    function handleFileInputChange(event) {
        const file = event.target.files[0];
        filename=file.name;
        processFile(file);
    }

    function processFile(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                sqlContent = event.target.result;
            };
            reader.readAsText(file);
        } else {
            alert("Please select a file.");
        }
    }

    function convertSQL(format) {
        if (sqlContent) {
            const data = extractDataFromSQL(sqlContent);
            generateOutput(data, format);
        } else {
            alert("Please upload a SQL file first.");
        }
    }

    function extractDataFromSQL(content) {
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
                const valuesPart = line.substring(line.indexOf('VALUES') + 6).trim();
                if (valuesString) {
                    valuesString += "," + valuesPart;
                } else {
                    valuesString = valuesPart;
                }
            } else if (line.endsWith(");")) {
                valuesString += line;
            } else if (line.startsWith("(") || valuesString) {
                valuesString += " " + line;
            }
        });

        const valueSets = valuesString.split(/(?<=\)),\s*(?=\()/);
        valueSets.forEach(valueSet => {
            const values = valueSet.replace(/^\(|\)$/g, '').split(/,\s*(?=(?:[^']*'[^']*')*[^']*$)/).map(value => value.trim().replace(/'/g, ''));
            data.push(values);
        });
        return data;
    }

    function generateOutput(data, format) {
        if (format === 'csv') {
            generateCSV(data);
        } else if (format === 'xlsx') {
            generateXLSX(data);
        } else if (format === 'mysql') {
            generateMySQL(data);
        } else if (format === 'sqlite') {
            generateSQLite(data);
        }
    }

    function generateCSV(data) {
        const csvContent = data.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadFile(blob, 'converted.csv');
    }

    function generateXLSX(data) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'converted.xlsx');
    }

    function generateMySQL(data) {
        let mysqlContent = '';
        const headers = data[0];
        data.slice(1).forEach(row => {
            const values = row.map(value => `'${value}'`).join(", ");
            mysqlContent += `INSERT INTO table_name (${headers.join(", ")}) VALUES (${values});\n`;
        });
        const blob = new Blob([mysqlContent], { type: 'text/plain;charset=utf-8;' });
        downloadFile(blob, 'converted.sql');
    }

    function generateSQLite(data) {
        let sqliteContent = 'BEGIN TRANSACTION;\n';
        const headers = data[0];
        data.slice(1).forEach(row => {
            const values = row.map(value => `'${value}'`).join(", ");
            sqliteContent += `INSERT INTO table_name (${headers.join(", ")}) VALUES (${values});\n`;
        });
        sqliteContent += 'COMMIT;';
        const blob = new Blob([sqliteContent], { type: 'text/plain;charset=utf-8;' });
        downloadFile(blob, 'converted.sqlite');
    }

    function downloadFile(blob, fileName) {
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
    }

    onMount(() => {
        uploadBox.addEventListener('click', handleUploadBoxClick);
        uploadBox.addEventListener('dragover', handleDragOver);
        uploadBox.addEventListener('dragleave', handleDragLeave);
        uploadBox.addEventListener('drop', handleDrop);
        fileInput.addEventListener('change', handleFileInputChange);

        return () => {
            uploadBox.removeEventListener('click', handleUploadBoxClick);
            uploadBox.removeEventListener('dragover', handleDragOver);
            uploadBox.removeEventListener('dragleave', handleDragLeave);
            uploadBox.removeEventListener('drop', handleDrop);
            fileInput.removeEventListener('change', handleFileInputChange);
        };
    });
</script>

<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden rounded-lg">
    <div class="container">
        <h1>Convert SQL</h1>
        <p>with our secure online converter</p>
        <div bind:this={uploadBox} class="upload-box">
            <input bind:this={fileInput} type="file" style="display: none;" />
            {#if filename==''}
            <p>Drag and drop your SQL file here or click to upload.</p>
              
            {:else}
            <p style="color:black;">{filename}</p>
            {/if}
        </div>
        <div class="buttons">
            <button class="csv-btn" on:click={() => convertSQL('csv')}>Convert to CSV</button>
            <button class="excel-btn" on:click={() => convertSQL('xlsx')}>Convert to XLSX</button>
            <button class="mysql-btn" on:click={() => convertSQL('mysql')}>Convert to MySQL</button>
            <button class="sqlite-btn" on:click={() => convertSQL('sqlite')}>Convert to SQLite</button>
        </div>
    </div>
</div>

      
<style>
        .container {
        text-align: center;
        background: #fff;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 1200px;
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