import Blog from "../models/Blog.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// ✅ Get all blogs with advanced filtering and search
export const getBlogs = async (req, res) => {
  try {
    const {
      category,
      featured,
      published = true,
      status,
      limit = 20,
      page = 1,
      search,
      tags,
      sortBy = "createdAt",
      sortOrder = "desc",
      author,
    } = req.query;

    // Build query
    const query = {};

    // Published filter - default to published=true for public access
    if (published === "false") {
      query.published = false;
    } else {
      query.published = true; // Default to published blogs
    }

    // Status filter (for admin)
    if (status) {
      query.status = status;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Featured filter
    if (featured) {
      query.featured = featured === "true";
    }

    // Author filter
    if (author) {
      query["author.name"] = new RegExp(author, "i");
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { excerpt: new RegExp(search, "i") },
        { content: new RegExp(search, "i") },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(",");
      query.tags = { $in: tagArray };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 50); // Max 50 per page

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const blogs = await Blog.find(query)
      .select("-content") // Exclude full content for list view
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .lean();

    const total = await Blog.countDocuments(query);

    // Add computed fields
    const blogsWithComputed = blogs.map((blog) => ({
      ...blog,
      url: `/blogs/${blog.slug}`,
      excerpt:
        blog.excerpt.substring(0, 200) +
        (blog.excerpt.length > 200 ? "..." : ""),
    }));

    res.status(200).json({
      success: true,
      blogs: blogsWithComputed,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        hasNext: page * limitNum < total,
        hasPrev: page > 1,
      },
      filters: {
        category,
        featured,
        published,
        status,
        search,
        tags,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message,
    });
  }
};

// ✅ Get single blog by ID or slug with enhanced features
export const getBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { incrementViews = true } = req.query;

    let blog;
    // Check if it's a slug or MongoDB ID
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(id);
    } else {
      blog = await Blog.findOne({ slug: id });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Check if blog is published (for public access)
    if (!blog.published && !req.admin) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Increment view count (with rate limiting in production)
    if (incrementViews === "true") {
      blog.views += 1;
      await blog.save();
    }

    // Get related blogs
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      category: blog.category,
      published: true,
    })
      .select("title slug image excerpt readTime createdAt")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // Add computed fields
    const blogWithComputed = {
      ...blog.toObject(),
      url: `/blogs/${blog.slug}`,
      relatedBlogs: relatedBlogs.map((related) => ({
        ...related,
        url: `/blogs/${related.slug}`,
      })),
    };

    res.status(200).json({
      success: true,
      blog: blogWithComputed,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message,
    });
  }
};

// ✅ Create new blog with validation and image upload
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      image,
      author,
      featured = false,
      published = false,
      seo,
    } = req.body;

    // Validate required fields
    if (!title || !excerpt || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, excerpt, content, category",
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

    // Check if Cloudinary is configured
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      if (isCloudinaryConfigured) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "grainly-blogs",
            transformation: [
              { width: 1200, height: 630, crop: "fill", quality: "auto" },
            ],
          });
          imageUrl = result.secure_url;
          fs.unlinkSync(file.path); // delete temp file
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          // Fallback to placeholder if Cloudinary fails
          imageUrl =
            "https://via.placeholder.com/1200x630/ff6b6b/ffffff?text=Blog+Image";
        }
      } else {
        // If Cloudinary not configured, use placeholder
        console.log("Cloudinary not configured, using placeholder image");
        imageUrl =
          "https://via.placeholder.com/1200x630/ff6b6b/ffffff?text=Blog+Image";
        fs.unlinkSync(file.path); // delete temp file
      }
    } else if (image && image.startsWith("data:")) {
      // Handle base64 image data
      if (isCloudinaryConfigured) {
        try {
          const result = await cloudinary.uploader.upload(image, {
            folder: "grainly-blogs",
            transformation: [
              { width: 1200, height: 630, crop: "fill", quality: "auto" },
            ],
          });
          imageUrl = result.secure_url;
        } catch (error) {
          console.error("Error uploading base64 image:", error);
          // Fallback to placeholder if Cloudinary fails
          imageUrl =
            "https://via.placeholder.com/1200x630/ff6b6b/ffffff?text=Blog+Image";
        }
      } else {
        // If Cloudinary not configured, use placeholder
        console.log("Cloudinary not configured, using placeholder image");
        imageUrl =
          "https://via.placeholder.com/1200x630/ff6b6b/ffffff?text=Blog+Image";
      }
    }

    // Create blog data
    const blogData = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category,
      tags: processedTags,
      image:
        imageUrl ||
        "https://via.placeholder.com/1200x630/ff6b6b/ffffff?text=Blog+Image",
      author: {
        name: author?.name || req.admin?.name || "Grainly Team",
        avatar: author?.avatar || "",
        bio: author?.bio || "",
      },
      featured: featured === true,
      published: published === true,
      status: published ? "published" : "draft",
      seo: seo || {},
    };

    const blog = await Blog.create(blogData);

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Blog with this title already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating blog",
      error: error.message,
    });
  }
};

// ✅ Update blog with validation and image upload
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      image,
      author,
      featured,
      published,
      seo,
    } = req.body;

    // Find existing blog
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
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

    // Check if Cloudinary is configured
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      if (isCloudinaryConfigured) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "grainly-blogs",
            transformation: [
              { width: 1200, height: 630, crop: "fill", quality: "auto" },
            ],
          });
          imageUrl = result.secure_url;
          fs.unlinkSync(file.path); // delete temp file
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          // Fallback to placeholder if Cloudinary fails
          imageUrl =
            "https://via.placeholder.com/1200x630/ff6b6b/ffffff?text=Blog+Image";
        }
      } else {
        // If Cloudinary not configured, use placeholder
        console.log("Cloudinary not configured, using placeholder image");
        imageUrl =
          "https://via.placeholder.com/1200x630/ff6b6b/ffffff?text=Blog+Image";
        fs.unlinkSync(file.path); // delete temp file
      }
    } else if (image && image.startsWith("data:")) {
      // Handle base64 image data
      if (isCloudinaryConfigured) {
        try {
          const result = await cloudinary.uploader.upload(image, {
            folder: "grainly-blogs",
            transformation: [
              { width: 1200, height: 630, crop: "fill", quality: "auto" },
            ],
          });
          imageUrl = result.secure_url;
        } catch (error) {
          console.error("Error uploading base64 image:", error);
          // Fallback to placeholder if Cloudinary fails
          imageUrl =
            "https://via.placeholder.com/1200x630/ff6b6b/ffffff?text=Blog+Image";
        }
      } else {
        // If Cloudinary not configured, use placeholder
        console.log("Cloudinary not configured, using placeholder image");
        imageUrl =
          "https://via.placeholder.com/1200x630/ff6b6b/ffffff?text=Blog+Image";
      }
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (excerpt !== undefined) updateData.excerpt = excerpt.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (category !== undefined) updateData.category = category;
    if (processedTags !== undefined) updateData.tags = processedTags;
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (author !== undefined) updateData.author = author;
    if (featured !== undefined) updateData.featured = featured;
    if (published !== undefined) {
      updateData.published = published;
      updateData.status = published ? "published" : "draft";
    }
    if (seo !== undefined) updateData.seo = seo;

    const blog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Blog with this title already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error.message,
    });
  }
};

// ✅ Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res
      .status(500)
      .json({ message: "Error deleting blog", error: error.message });
  }
};

// ✅ Get featured blogs
export const getFeaturedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ featured: true, published: true })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching featured blogs:", error);
    res.status(500).json({
      message: "Error fetching featured blogs",
      error: error.message,
    });
  }
};

// ✅ Get blogs by category
export const getBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const blogs = await Blog.find({ category, published: true }).sort({
      createdAt: -1,
    });

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs by category:", error);
    res.status(500).json({
      message: "Error fetching blogs",
      error: error.message,
    });
  }
};
