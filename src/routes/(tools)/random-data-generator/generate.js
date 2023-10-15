import { valueReturn } from "./store";
import { js2csv, js2tsv } from "./dataConverter";
import download from "downloadjs";

export function generateData(schema, dataFormat, noOfRows) {
  let fieldTypes = [];
  let fieldNames = [];
  let testData = [];

  for (let i in schema) {
    fieldNames[i] = schema[i].name;
    fieldTypes[i] = schema[i].type;
  }

  for (let i = 0; i < noOfRows; i++) {
    let newData = {};
    for (let j = 0; j < schema.length; j++) {
      newData[fieldNames[j]] = valueReturn(fieldTypes[j]);
    }
    testData[i] = newData;
  }

  console.log(testData);
  initiateDownload(testData, dataFormat);
}

function initiateDownload(testData, dataFormat) {
  switch (dataFormat) {
    case "JSON":
      download(JSON.stringify(testData), "testData.json", "text/plain");
      break;

    case "CSV":
      download(js2csv(testData), "testData.csv", "text/plain");
      break;

    case "JavaScript":
      download(testData, "testData.js", "text/plain");
      break;

    case "TSV":
      download(js2tsv(testData), "testData.tsv", "text/plain");
      break;
  }
}
