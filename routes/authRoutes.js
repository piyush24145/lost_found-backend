const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile 
} = require("../controllers/auth.controller"); 

const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile); 
router.patch("/profile", protect, upload.single("profilePic"), updateUserProfile); 

module.exports = router;
