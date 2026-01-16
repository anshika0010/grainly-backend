import Product from "../models/Product.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// ✅ Create a new product with image upload
export const createProduct = async (req, res) => {
  try {
    const {
      itemName,
      flavour,
      price,
      discountPrice,
      stock,
      description,
      shortDescription,
      category,
      tags,
      image,
      isActive,
      // Additional product details
      brand,
      netQuantity,
      itemForm,
      itemWeight,
      dimensions,
      specialIngredients,
      dietType,
      productBenefits,
      // directions,
      // warnings,
      // precautions,
      // keyFeatures,
    } = req.body;

    // Validate required fields
    if (
      !itemName ||
      !flavour ||
      !price ||
      !stock ||
      !description ||
      !shortDescription ||
      !category
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: itemName, flavour, price, stock, description, shortDescription, category",
      });
    }

    // Validate price
    if (price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    // Validate discount price
    if (discountPrice && discountPrice >= price) {
      return res.status(400).json({
        message: "Discount price must be less than regular price",
      });
    }

    // Validate stock
    if (stock < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative",
      });
    }

    // Process tags
    const processedTags =
      tags && typeof tags === "string"
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : Array.isArray(tags)
        ? tags
        : [];

    // Handle image upload if provided
    let imageUrl = image || "";
    if (req.files && req.files.length > 0) {
      try {
        const file = req.files[0];
        console.log("📸 Uploading image to Cloudinary:", file.originalname);

        const result = await cloudinary.uploader.upload(file.path, {
          folder: "grainly-products",
          resource_type: "auto",
        });

        imageUrl = result.secure_url;
        console.log("✅ Image uploaded successfully:", imageUrl);

        // Delete temp file
        fs.unlinkSync(file.path);
        console.log("🧹 Temp file deleted");
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError.message);

        // Check if it's a configuration error
        if (
          uploadError.message.includes("Invalid cloud_name") ||
          uploadError.message.includes("Invalid API key") ||
          uploadError.message.includes("Invalid API secret")
        ) {
          return res.status(500).json({
            message:
              "Image upload service not configured. Please check Cloudinary configuration.",
            error: "Cloudinary configuration error",
          });
        }

        // For other errors, continue without image
        console.log("⚠️ Continuing without image due to upload error");
        imageUrl = "";
      }
    }

    const newProduct = await Product.create({
      itemName: itemName.trim(),
      flavour: flavour.trim(),
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      stock: parseInt(stock),
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      category,
      tags: processedTags,
      image: imageUrl,
      isActive: isActive !== false,
      // Additional product details
      brand: brand?.trim() || "Grainly",
      netQuantity: netQuantity?.trim() || "",
      itemForm: itemForm?.trim() || "",
      itemWeight: itemWeight?.trim() || "",
      dimensions: dimensions?.trim() || "",
      specialIngredients: specialIngredients?.trim() || "",
      dietType: dietType?.trim() || "",
      productBenefits: productBenefits?.trim() || "",
    });

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors: errors,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Product with this name already exists",
      });
    }

    res.status(500).json({
      message: "Error creating product",
      error: error.message,
    });
  }
};

// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// ✅ Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const param = req.params.id;
    let product;

    // Check if param is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(param)) {
      product = await Product.findById(param);
    } else {
      // Treat it as flavour name
      const flavourName = param.replace(/-/g, " ").toLowerCase();

      product = await Product.findOne({
        flavour: { $regex: new RegExp(`^${flavourName}$`, "i") },
      });
    }

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};
// ✅ Update product
export const updateProduct = async (req, res) => {
  try {
    const {
      itemName,
      flavour,
      price,
      discountPrice,
      stock,
      description,
      category,
      tags,
      image,
      isActive,
    } = req.body;

    // Validate price if provided
    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    // Validate discount price if provided
    if (
      discountPrice !== undefined &&
      price !== undefined &&
      discountPrice >= price
    ) {
      return res.status(400).json({
        message: "Discount price must be less than regular price",
      });
    }

    // Validate stock if provided
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative",
      });
    }

    // Process tags if provided
    let processedTags = undefined;
    if (tags !== undefined) {
      processedTags =
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : Array.isArray(tags)
          ? tags
          : [];
    }

    // Handle image upload if provided
    let imageUrl = image;
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "grainly-products",
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(file.path); // delete temp file
    }

    // Prepare update data
    const updateData = {};
    if (itemName !== undefined) updateData.itemName = itemName.trim();
    if (flavour !== undefined)
      updateData.flavour = flavour ? flavour.trim() : "";
    if (price !== undefined) updateData.price = parseFloat(price);
    if (discountPrice !== undefined)
      updateData.discountPrice = discountPrice
        ? parseFloat(discountPrice)
        : null;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (processedTags !== undefined) updateData.tags = processedTags;
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors: errors,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Product with this name already exists",
      });
    }

    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

// Get all flavours from products

// export const getAllFlavours = async (req, res) => {
//   try {
//     // Fetch only flavour and _id
//     const products = await Product.find({}, "_id flavour itemName ");

//     // Remove empty/null flavour values
//     const validProducts = products.filter((p) => p.flavour && p.flavour.trim());

//     // Optional: Remove duplicates by flavour name (keep the first product for each flavour)
//     const uniqueFlavours = [];
//     const seen = new Set();

//     for (const p of validProducts) {
//       if (!seen.has(p.flavour)) {
//         seen.add(p.flavour);
//         uniqueFlavours.push({
//           id: p._id,
//           flavour: p.flavour,
//           itemName: p.itemName,
//         });
//       }
//     }

//     res.status(200).json(uniqueFlavours);
//   } catch (error) {
//     console.error("Error fetching flavours:", error);
//     res.status(500).json({ message: "Server error while fetching flavours" });
//   }
// };
// export const getAllFlavours = async (req, res) => {
//   try {
//     const products = await Product.find(
//       { flavour: { $ne: null } },
//       "_id flavour itemName"
//     );

//     const result = products.map((p) => ({
//       id: p._id,
//       flavour: p.flavour,
//       itemName: p.itemName,
//     }));

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error fetching flavours:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const getAllFlavours = async (req, res) => {
  try {
    const products = await Product.find({}).lean();

    console.log("FIRST PRODUCT 👉", products[0]);

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getProductByIdOrFlavour = async (req, res) => {
  try {
    const param = req.params.id; // this is the value from URL

    let product;

    // Check if param is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(param)) {
      product = await Product.findById(param);
    } else {
      // Treat param as flavour
      const flavourName = param.replace(/-/g, " ").toLowerCase();

      product = await Product.findOne({
        flavour: { $regex: new RegExp(`^${flavourName}$`, "i") },
      });
    }

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};
