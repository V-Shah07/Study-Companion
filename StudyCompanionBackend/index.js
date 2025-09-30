const express = require("express");
const cors = require("cors");
const Tesseract = require("tesseract.js");
const multer = require("multer");
const fs = require("fs");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

// Get API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ OPENAI_API_KEY environment variable is required!");
  console.error("Please create a .env file with your OpenAI API key.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: apiKey });

//used gpt here as i needed this to upload audio files and i couldn't figure it out myself, rest was done by me
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    cb(null, true);
  },
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json({ limit: "10mb" }));

app.get("/", function (req, res) {
  res.send("server is running");
});

app.post("/classify-note", function (req, res) {
  const title = req.body.title;
  const note = req.body.note;

  if (!title && !note) {
    return res.status(400).json({
      error: "conten is required",
    });
  }

  let textToClassIfy = "";
  if (title) {
    textToClassIfy = textToClassIfy + title;
  }
  if (note) {
    if (textToClassIfy) {
      textToClassIfy = textToClassIfy + " " + note;
    } else {
      textToClassIfy = note;
    }
  }
  textToClassIfy = textToClassIfy.trim();

  const pRompt =
    'Classify the note into one of these subjects: Mathematics, Science, History, Literature, Business, Technology, Personal, Health, Finance, Travel, Cooking, Other.\n\nNote content: "' +
    textToClassIfy +
    '"\n\nRespond with only the subject name and a confidence score (0-1), formatted as: "Subject: [SUBJECT], Confidence: [SCORE]"\n\nIf you\'re unsure, classify as "Other" with appropriate confidence.';

  openai.chat.completions
    .create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a note classification assistant. Classify notes into academic and personal subjects accurately.",
        },
        {
          role: "user",
          content: pRompt,
        },
      ],
      max_tokens: 50,
      temperature: 0.3,
    })
    .then(function (compLetion) {
      const response = compLetion.choices[0].message.content;

      const subjectMatch = response.match(/Subject:\s*([^,]+)/i);
      const confidenceMatcH = response.match(/Confidence:\s*([0-9.]+)/i);

      let subject = "Other";
      if (subjectMatch) {
        subject = subjectMatch[1].trim();
      }

      let confIdence = 0.5;
      if (confidenceMatcH) {
        confIdence = parseFloat(confidenceMatcH[1]);
      }

      res.json({
        success: true,
        subject: subject,
        confidence: confIdence,
      });
    })
    .catch(function (error) {
      res.status(500).json({
        success: false,
        error: "Classification failed",
        details: error.message,
      });
    });
});

app.post("/ocr", function (req, res) {
  if (!req.body) {
    return res.status(400).json({ error: "No request body" });
  }

  const imageBase64 = req.body.imageBase64;

  if (!imageBase64) {
    return res.status(400).json({ error: "No image provided" });
  }

  let imageData = imageBase64;
  if (imageBase64.startsWith("data:image") === false) {
    imageData = "data:image/png;base64," + imageBase64;
  }

  Tesseract.recognize(imageData, "eng", {
    logger: function (progres) {},
  })
    .then(function (resUlt) {
      const texT = resUlt.data.text;

      res.json({
        success: true,
        text: texT,
        confidence: resUlt.data.confidence,
      });
    })
    .catch(function (err) {
      res.status(500).json({
        success: false,
        error: "OCR failed",
        details: err.message,
      });
    });
});

app.post("/audio-to-text", upload.single("audio"), function (req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file provided" });
  }

  const audioFilePath = req.file.path;
  let originalName = req.file.originalname;
  if (!originalName) {
    originalName = "recording.m4a";
  }

  let fileExtensioN = "m4a";
  if (originalName.includes(".")) {
    const parts = originalName.split(".");
    fileExtensioN = parts[parts.length - 1];
  }

  const newFilePath = audioFilePath + "." + fileExtensioN;

  fs.copyFileSync(audioFilePath, newFilePath);

  const audioStreaM = fs.createReadStream(newFilePath);

  openai.audio.transcriptions
    .create({
      file: audioStreaM,
      model: "whisper-1",
    })
    .then(function (transcripTion) {
      const transcribedTexT = transcripTion.text;

      fs.unlink(audioFilePath, function (err) {
        if (err) {
        }
      });
      fs.unlink(newFilePath, function (err) {
        if (err) {
        }
      });

      res.json({
        success: true,
        text: transcribedTexT,
      });
    })
    .catch(function (error) {
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, function (err) {});

        let originalNameForCleanup = req.file.originalname;
        if (!originalNameForCleanup) {
          originalNameForCleanup = "recording.m4a";
        }

        let fileExtensionForCleanuP = "m4a";
        if (originalNameForCleanup.includes(".")) {
          const parts = originalNameForCleanup.split(".");
          fileExtensionForCleanuP = parts[parts.length - 1];
        }

        const newFilePathForCleanup =
          req.file.path + "." + fileExtensionForCleanuP;
        fs.unlink(newFilePathForCleanup, function (err) {});
      }

      res.status(500).json({
        success: false,
        error: "Failed  transcribe ",
        details: error.message,
      });
    });
});

app.listen(port, "0.0.0.0", function () {
  console.log(" server running at http://127.0.0.1:" + port + "/");
});
