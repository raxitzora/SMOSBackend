import multer from "multer";
import path from "path";
import fs from "fs";

// Create temp directory if missing
const uploadDir = "src/uploads/temp";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Storage
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },

  filename(req, file, cb) {
    const uniqueName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

/**
 * Allow only videos
 */
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only video files are allowed."
      ),
      false
    );
  }
};

/**
 * Upload Middleware
 */
const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize:
      1024 * 1024 * 1024, // 1 GB
  },
});




/* ============================
   Audio Upload
============================ */

const audioDir = "uploads/audio";

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}${path.extname(file.originalname)}`
    );
  },
});

export const uploadAudio = multer({
  storage: audioStorage,

  limits: {
    fileSize: 25 * 1024 * 1024,
  },

  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed."));
    }
  },
});



export default upload;