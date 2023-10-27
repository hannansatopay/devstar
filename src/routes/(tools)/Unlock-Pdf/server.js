const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");

const app = express();
const port = 5173;

const upload = multer();

app.post("/decrypt-pdf", upload.single("pdfFile"), async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const password = req.body.password;

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    if (pdfDoc.isEncrypted) {
      await pdfDoc.decrypt(password);
    }

    const modifiedPdfBuffer = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.send(modifiedPdfBuffer);
  } catch (error) {
    console.error("Error decrypting the PDF:", error);
    res.status(500).send("Error decrypting the PDF. Please check the password and try again.");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});