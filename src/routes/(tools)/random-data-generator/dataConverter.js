export function js2csv(testData) {
  const replacer = (key, value) => (value === null ? null : value);
  const header = Object.keys(testData[0]);
  const csv = [
    header.join(","),
    ...testData.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    ),
  ].join("\r\n");
  console.log(csv);
  return csv;
}

export function js2tsv(testData) {
  const replacer = (key, value) => (value === null ? null : value);
  const header = Object.keys(testData[0]);
  const csv = [
    header.join("\t"),
    ...testData.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join("\t")
    ),
  ].join("\r\n");
  console.log(csv);
  return csv;
}
