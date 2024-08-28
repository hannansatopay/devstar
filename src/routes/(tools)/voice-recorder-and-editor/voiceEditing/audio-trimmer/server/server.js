const express = require('express');
const fileUpload = require('express-fileupload');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(fileUpload());

app.post('/trim', async (req, res) => {
    if (!req.files || !req.body.startTime || !req.body.endTime) {
        return res.status(400).send('Missing parameters');
    }

    const audio = req.files.audio;
    const startTime = parseFloat(req.body.startTime);
    const endTime = parseFloat(req.body.endTime);
    const outputPath = path.join(__dirname, 'trimmed_audio.mp3');

    console.log('Received file:', audio);

    if (!audio || !audio.data) {
        return res.status(400).send('Invalid audio file');
    }

    const tempInputPath = path.join(__dirname, 'temp_input_audio.mp3');
    fs.writeFileSync(tempInputPath, audio.data);

    // Verify the temporary file content
    const tempFileSize = fs.statSync(tempInputPath).size;
    console.log(`Temporary input file size: ${tempFileSize} bytes`);

    ffmpeg(tempInputPath)
        .inputFormat('mp3') // Assuming the input format is mp3, change if needed
        .setStartTime(startTime)
        .setDuration(endTime - startTime)
        .output(outputPath)
        .on('start', (commandLine) => {
            console.log('Spawned FFmpeg with command:', commandLine);
        })
        .on('progress', (progress) => {
            console.log('Processing progress:', progress);
        })
        .on('end', async () => {
            console.log('Processing finished successfully');
            try {
                await prisma.audio.create({
                    data: {
                        filename: audio.name,
                        startTime,
                        endTime,
                    },
                });

                res.download(outputPath, 'trimmed_audio.mp3', (err) => {
                    if (err) {
                        console.error('Error sending file:', err);
                    }
                    fs.unlinkSync(outputPath);
                    fs.unlinkSync(tempInputPath);
                });
            } catch (error) {
                console.error('Error saving metadata to database:', error);
                res.status(500).send('Error saving metadata');
            }
        })
        .on('error', (err) => {
            console.error('Error processing file:', err.message);
            res.status(500).send('Error processing file');
            fs.unlinkSync(tempInputPath);
        })
        .run();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
