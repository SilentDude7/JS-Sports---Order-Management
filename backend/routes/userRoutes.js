// routes/userRoutes.js
import express from "express";
import User from "../models/user.js";

const router = express.Router();

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role, address, phone } = req.body;
    const newUser = new User({ name, email, password, role, address, phone });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/users/check-customer?name=John&email=john@example.com&phone=1234567890
router.get('/check-customer', async (req, res) => {
  try {
    const { name, email, phone } = req.query;

    const user = await User.findOne({ name, email, phone });
    if (!user) {
      return res.status(404).json({ message: 'Person not available' });
    }

    res.json({ message: 'Person exists', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Public (or Admin)
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public (or Admin)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user by ID
// @route   PUT /api/users/:id
// @access  Public (or Admin)
router.put("/:id", async (req, res) => {
  try {
    const { name, email, role, address, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, address, phone },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete user by ID
// @route   DELETE /api/users/:id
// @access  Admin
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



export default router;
