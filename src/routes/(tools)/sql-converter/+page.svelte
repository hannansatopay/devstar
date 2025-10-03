<script>
    import { onMount } from "svelte";
    import * as XLSX from "xlsx";

    let sqlContent = "";
    let uploadBox;
    let fileInput;
    let filename = "";

    function handleUploadBoxClick() {
        fileInput.click();
    }

    function handleDragOver(event) {
        event.preventDefault();
        uploadBox.classList.add("dragover");
    }

    function handleDragLeave() {
        uploadBox.classList.remove("dragover");
    }

    function handleDrop(event) {
        event.preventDefault();
        uploadBox.classList.remove("dragover");
        const file = event.dataTransfer.files[0];
        fileInput.files = event.dataTransfer.files;
        filename = file.name;
        processFile(file);
    }

    function handleFileInputChange(event) {
        const file = event.target.files[0];
        filename = file.name;
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

    // Extract and clean data from SQL, handling edge cases
    function extractDataFromSQL(content) {
        const data = [];
        const lines = content.split("\n");
        let headers = null;
        let valuesString = "";
        let insideInsert = false;

        lines.forEach((line) => {
            line = line.trim();

            // Detect INSERT INTO statement
            if (line.startsWith("INSERT INTO")) {
                const headerMatch = line.match(/\(([^)]+)\)/);
                if (headerMatch) {
                    headers = headerMatch[1]
                        .replace(/`/g, "")
                        .split(",")
                        .map((header) => header.trim());
                    if (data.length === 0) {
                        data.push(headers); // Add headers only once
                    }
                    insideInsert = true;
                }
                return;
            }

            // Capture values after "VALUES"
            if (insideInsert && line.includes("VALUES")) {
                const valuesPart = line
                    .substring(line.indexOf("VALUES") + 6)
                    .trim();
                valuesString += valuesPart;
            } else if (insideInsert) {
                valuesString += " " + line;
            }

            // When we encounter a closing parenthesis or end of values
            if (insideInsert && line.endsWith(");")) {
                valuesString = valuesString.replace(");", "").trim(); // Remove the final );
                insideInsert = false;
            }
        });

        // Handle values cleanly
        const valueSets = valuesString.split(/(?<=\)),\s*(?=\()/);
        valueSets.forEach((valueSet) => {
            const values = valueSet
                .replace(/^\(|\)$/g, "") // Remove surrounding parentheses
                .split(/,\s*(?=(?:[^']*'[^']*')*[^']*$)/) // Handle commas inside quotes correctly
                .map((value) => value.trim().replace(/'/g, "")); // Clean up extra quotes

            data.push(values);
        });

        return data;
    }

    // Generate file based on format (CSV, XLSX, MySQL, SQLite)
    function generateOutput(data, format) {
        if (format === "csv") {
            generateCSV(data);
        } else if (format === "xlsx") {
            generateXLSX(data);
        } else if (format === "mysql") {
            generateMySQL(data);
        } else if (format === "sqlite") {
            generateSQLite(data);
        }
    }

    // Generate CSV file
    function generateCSV(data) {
        const csvContent = data.map((e) => e.join(",")).join("\n");
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        downloadFile(blob, "converted.csv");
    }

    // Generate XLSX file
    function generateXLSX(data) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "converted.xlsx");
    }

    // Generate MySQL file
    function generateMySQL(data) {
        let mysqlContent = "";
        const headers = data[0];
        data.slice(1).forEach((row) => {
            const values = row.map((value) => `'${value}'`).join(", ");
            mysqlContent += `INSERT INTO table_name (${headers.join(", ")}) VALUES (${values});\n`;
        });
        const blob = new Blob([mysqlContent], {
            type: "text/plain;charset=utf-8;",
        });
        downloadFile(blob, "converted.sql");
    }

    // Generate SQLite file
    function generateSQLite(data) {
        let sqliteContent = "BEGIN TRANSACTION;\n";
        const headers = data[0];
        data.slice(1).forEach((row) => {
            const values = row.map((value) => `'${value}'`).join(", ");
            sqliteContent += `INSERT INTO table_name (${headers.join(", ")}) VALUES (${values});\n`;
        });
        sqliteContent += "COMMIT;";
        const blob = new Blob([sqliteContent], {
            type: "text/plain;charset=utf-8;",
        });
        downloadFile(blob, "converted.sqlite");
    }

    // Trigger file download
    function downloadFile(blob, fileName) {
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    onMount(() => {
        uploadBox.addEventListener("click", handleUploadBoxClick);
        uploadBox.addEventListener("dragover", handleDragOver);
        uploadBox.addEventListener("dragleave", handleDragLeave);
        uploadBox.addEventListener("drop", handleDrop);
        fileInput.addEventListener("change", handleFileInputChange);

        return () => {
            uploadBox.removeEventListener("click", handleUploadBoxClick);
            uploadBox.removeEventListener("dragover", handleDragOver);
            uploadBox.removeEventListener("dragleave", handleDragLeave);
            uploadBox.removeEventListener("drop", handleDrop);
            fileInput.removeEventListener("change", handleFileInputChange);
        };
    });
</script>

<section class="py-2">
    <div class="gap-8 items-center mx-auto max-w-screen-xl grid grid-cols-1 overflow-hidden rounded-lg">
        <div
            bind:this={uploadBox}
            class="bg-gray-200 text-gray-800 flex items-center justify-center p-8 border border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-blue-50"
            on:click={handleUploadBoxClick}
            on:keydown={(event) =>
                event.key === "Enter" && handleUploadBoxClick()}
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            on:drop={handleDrop}
        >
            <input
                bind:this={fileInput}
                type="file"
                class="hidden"
                on:change={handleFileInputChange}
            />
            {#if filename === ""}
                <p class="text-sm lg:text-lg text-gray-600">
                    Drag and drop your SQL file here or click to upload.
                </p>
            {:else}
                <p class="text-sm lg:text-lg">{filename}</p>
            {/if}
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 lg:flex lg:space-x-4 lg:justify-center">
            <button
                class="px-4 py-2 bg-blue-500 text-sm lg:text-lg text-white rounded-lg hover:bg-green-600"
                on:click={() => convertSQL("csv")}
            >
                Convert to CSV
            </button>
            <button
                class="px-4 py-2 bg-green-500 text-sm lg:text-lg text-white rounded-lg hover:bg-blue-600"
                on:click={() => convertSQL("xlsx")}
            >
                Convert to XLSX
            </button>
            <button
                class="px-4 py-2 bg-orange-500 text-sm lg:text-lg text-white rounded-lg hover:bg-orange-600"
                on:click={() => convertSQL("mysql")}
            >
                Convert to MySQL
            </button>
            <button
                class="px-4 py-2 bg-purple-500 text-sm lg:text-lg text-white rounded-lg hover:bg-purple-600"
                on:click={() => convertSQL("sqlite")}
            >
                Convert to SQLite
            </button>
        </div>
    </div>
</section>

