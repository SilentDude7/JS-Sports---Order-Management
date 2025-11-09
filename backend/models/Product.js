// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    sku: { type: String, trim: true },
    category: { type: String, trim: true },
    brand: { type: String, trim: true },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    collections: { type: String, trim: true },
    material: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "unisex"] },
    images: [{ url: { type: String } }],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
