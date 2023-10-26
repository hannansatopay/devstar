const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");

const app = express();
const port = 5173;

// Multer configuration for handling file uploads
const upload = multer();

// Endpoint for decrypting PDF
app.post("/decrypt-pdf", upload.single("pdfFile"), async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const password = req.body.password;

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    if (pdfDoc.isEncrypted) {
      await pdfDoc.decrypt(password);
    }

    // Modify the PDF if needed
    // For example, you can add content to the PDF or perform other operations here

    // Save the modified PDF to a buffer
    const modifiedPdfBuffer = await pdfDoc.save();

    // Send the modified PDF as the response
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