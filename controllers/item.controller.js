const Item = require("../models/Item");
const checkAndMatchItem = async (newItem) => {
  try {
    const oppositeType = newItem.type === "lost" ? "found" : "lost";
    const possibleMatches = await Item.find({
      type: oppositeType,
      title: { $regex: `^${newItem.title}$`, $options: "i" }, 
     location: { $regex: newItem.location, $options: "i" },
      category: { $regex: `^${newItem.category}$`, $options: "i" },
    });

    for (const match of possibleMatches) {
      if (!newItem.matchedWith && !match.matchedWith) {
        newItem.matchedWith = match._id;
        match.matchedWith = newItem._id;
        newItem.matchReason = "title+location+category";
        match.matchReason = "title+location+category";

        await match.save();
        await newItem.save();
      }
    }
  } catch (err) {
    console.error("❌ checkAndMatchItem error:", err);
  }
};
const createItem = async (req, res) => {
  try {
    const {
      type,
      name,
      contactNumber,
      email,
      category,
      title,
      description,
      location,
      date,
    } = req.body;

    if (!["found", "lost"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Invalid type (must be 'found' or 'lost')" });
    }

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const newItem = new Item({
      type,
      name,
      contactNumber,
      email,
      category,
      title,
      description,
      location,
      date,
      images: imagePaths,
      user: req.user._id,
    });
    await newItem.save();
    await checkAndMatchItem(newItem);
    res
      .status(201)
      .json({ message: `${type} item reported successfully`, item: newItem });
  } catch (error) {
    console.error("createItem error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getAllItems = async (req, res) => {
  try {
    const { type } = req.query; 
    const filter = {};

    if (type && ["found", "lost"].includes(type)) {
      filter.type = type;
    }
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error("getAllItems error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("matchedWith");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("getItemById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await item.deleteOne();
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("deleteItem error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const markItemResolved = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findByIdAndUpdate(
      itemId,
      { isResolved: true, resolvedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ message: "Error resolving item", error });
  }
};
const searchItems = async (req, res) => {
  try {
    const { q, type } = req.query;
    const filter = {};

    if (type && ["found", "lost"].includes(type)) {
      filter.type = type;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ];
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error("searchItems error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getMatchedItems = async (req, res) => {
  try {
    const matchedItems = await Item.find({ matchedWith: { $ne: null } })
      .populate("matchedWith")
      .sort({ createdAt: -1 });

    res.json(matchedItems);
  } catch (error) {
    console.error("getMatchedItems error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  deleteItem,
  searchItems,
  markItemResolved,
  getMatchedItems, 
};

