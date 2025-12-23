import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: false, // Will be auto-generated from title
      unique: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [100, "Content must be at least 100 characters"],
    },
    image: {
      type: String,
      required: false, // Will use placeholder if not provided
      validate: {
        validator: function (v) {
          // Allow empty string, data URLs, and valid HTTP URLs
          return (
            !v ||
            v.startsWith("data:") ||
            /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v) ||
            v.includes("placeholder")
          );
        },
        message: "Image must be a valid URL or data URL",
      },
    },
    author: {
      name: {
        type: String,
        required: true,
        default: "Grainly Team",
        maxlength: [100, "Author name cannot exceed 100 characters"],
      },
      avatar: {
        type: String,
        validate: {
          validator: function (v) {
            // Allow empty string, data URLs, and valid HTTP URLs
            return (
              !v ||
              v.startsWith("data:") ||
              /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v)
            );
          },
          message: "Avatar must be a valid image URL or data URL",
        },
      },
      bio: {
        type: String,
        maxlength: [300, "Bio cannot exceed 300 characters"],
      },
    },
    category: {
      type: String,
      enum: [
        "Nutrition",
        "Recipes",
        "Health",
        "Lifestyle",
        "Tips",
        "Product News",
        "Wellness",
        "Fitness",
        "Cooking",
        "Reviews",
      ],
      required: [true, "Category is required"],
      default: "Nutrition",
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: "Cannot have more than 10 tags",
      },
    },
    readTime: {
      type: Number,
      default: 5,
      min: [1, "Read time must be at least 1 minute"],
      max: [60, "Read time cannot exceed 60 minutes"],
    },
    published: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },
    likes: {
      type: Number,
      default: 0,
      min: [0, "Likes cannot be negative"],
    },
    shares: {
      type: Number,
      default: 0,
      min: [0, "Shares cannot be negative"],
    },
    seo: {
      metaTitle: {
        type: String,
        maxlength: [60, "Meta title cannot exceed 60 characters"],
      },
      metaDescription: {
        type: String,
        maxlength: [160, "Meta description cannot exceed 160 characters"],
      },
      keywords: [String],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate slug from title if not provided
blogSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Add timestamp to ensure uniqueness
    if (this.isNew) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }

  // Auto-generate read time based on content length
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  // Set publishedAt when status changes to published
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
    this.published = true;
  }

  // Update lastModified
  this.lastModified = new Date();

  next();
});

// Virtual for SEO-friendly URL
blogSchema.virtual("url").get(function () {
  return `/blogs/${this.slug}`;
});

// Index for better performance
blogSchema.index({ slug: 1 });
blogSchema.index({ published: 1, createdAt: -1 });
blogSchema.index({ category: 1, published: 1 });
blogSchema.index({ featured: 1, published: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ status: 1 });

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
