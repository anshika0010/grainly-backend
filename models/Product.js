import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Basic Product Information
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    flavour: {
      type: String,
      required: [true, "Flavour is required"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },

    // Pricing Information
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    // Inventory Management
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Product Classification
    category: {
      type: String,
      required: true,
      enum: ["Classic", "Decadent", "Global Delicious", "Pre-workout / Sports Nutrition"],
    },
    tags: {
      type: [String],
      default: [],
    },

    // Media
    image: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },

    // Product Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Additional product details
    brand: {
      type: String,
    },
    netQuantity: {
      type: String,
      default: "",
    },
    itemForm: {
      type: String,
      default: "",
    },
    itemWeight: {
      type: String,
      default: "",
    },
    dimensions: {
      type: String,
      default: "",
    },
    specialIngredients: {
      type: String,
      default: "",
    },
    dietType: {
      type: String,
      default: "",
    },

    // 🟢 Newly Added Fields
    productBenefits: {
      type: [String],
      default: [],
    },
    directions: {
      type: [String],
      default: [],
    },
    precautions: {
      type: [String],
      default: [],
    },
    keyFeatures: {
      type: [String],
      default: [],
    },

    // Optional warnings/info
    warnings: {
      type: String,
      default: "",
    },

    // Legacy fields (for backward compatibility)
    skuId: {
      type: String,
      unique: true,
      sparse: true,
    },
    itemTitle: String,
    fullDescription: String,
    howToUse: String,
    supplementFacts: String,
    benefits: String,

    // Legacy pricing fields
    totalPrice: Number,
    discountedPrice: Number,

    flavours: {
      type: [String],
      enum: [
        "Vanilla Ice Cream",
        "Firni",
        "Batheeth",
        "Soleh Zard",
        "Tiramisu",
        "Peach & Cream",
        "Carrot Cake",
        "Apple Pie",
        "Cookies and Cream",
        "Strawberry Shortcake",
        "Chocolate Peanut Butter",
        "Fruit Punch",
        "Blue Raspberry",
        "Gummy Bliss",
        "Purple Pulse Gummies"
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
