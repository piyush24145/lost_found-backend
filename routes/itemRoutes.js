const express = require("express");
const router = express.Router();
const {
  createItem,
  getAllItems,
  getItemById,
  deleteItem,
  searchItems,
  getMatchedItems, 
} = require("../controllers/item.controller");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
router.post("/", protect, upload.array("images", 5), createItem);
router.get("/", getAllItems);
router.get("/search", searchItems);
router.get("/matched", getMatchedItems);
router.get("/:id", getItemById);
router.delete("/:id", protect, deleteItem);
module.exports = router;
