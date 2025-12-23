import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Blog from "./models/Blog.js";

dotenv.config();

const sampleBlogs = [
  {
    title: "The Ultimate Guide to Healthy Breakfast",
    excerpt:
      "Discover the best breakfast options for a healthy start to your day with Grainly products.",
    content: `
      <h2>Why Breakfast Matters</h2>
      <p>Starting your day with a nutritious breakfast is crucial for maintaining energy levels and supporting overall health. Our Grainly Cream of Rice provides the perfect foundation for a healthy morning routine.</p>
      
      <h3>Benefits of Grainly Products</h3>
      <ul>
        <li>High in essential nutrients</li>
        <li>Easy to digest</li>
        <li>Versatile and delicious</li>
        <li>Perfect for busy mornings</li>
      </ul>
      
      <h3>Recipe Ideas</h3>
      <p>Try our Grainly Cream of Rice with fresh fruits, nuts, and a drizzle of honey for a complete breakfast experience.</p>
    `,
    category: "Nutrition",
    tags: ["breakfast", "healthy", "nutrition", "grainly"],
    image:
      "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&h=630&fit=crop",
    author: {
      name: "Dr. Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      bio: "Nutritionist and wellness expert with 10+ years of experience.",
    },
    featured: true,
    published: true,
    seo: {
      metaTitle: "Healthy Breakfast Guide with Grainly",
      metaDescription:
        "Learn about healthy breakfast options and how Grainly products can help you start your day right.",
      keywords: ["healthy breakfast", "nutrition", "grainly", "wellness"],
    },
  },
  {
    title: "5 Easy Recipes with Grainly Cream of Rice",
    excerpt:
      "Simple and delicious recipes you can make with Grainly Cream of Rice in under 15 minutes.",
    content: `
      <h2>Quick and Easy Recipes</h2>
      <p>Grainly Cream of Rice is incredibly versatile and can be used in various recipes. Here are our top 5 favorites:</p>
      
      <h3>1. Classic Cream of Rice</h3>
      <p>Simply mix with hot water or milk, add your favorite toppings, and enjoy!</p>
      
      <h3>2. Fruit and Nut Bowl</h3>
      <p>Top your Grainly Cream of Rice with fresh berries, sliced bananas, and chopped nuts.</p>
      
      <h3>3. Savory Rice Porridge</h3>
      <p>Add vegetables, herbs, and a touch of salt for a savory breakfast option.</p>
      
      <h3>4. Smoothie Bowl Base</h3>
      <p>Use cooled Grainly Cream of Rice as a base for your favorite smoothie bowl.</p>
      
      <h3>5. Dessert Rice Pudding</h3>
      <p>Sweeten with honey or maple syrup and add cinnamon for a healthy dessert.</p>
    `,
    category: "Recipes",
    tags: ["recipes", "cooking", "easy", "grainly"],
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1200&h=630&fit=crop",
    author: {
      name: "Chef Michael Chen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      bio: "Professional chef specializing in healthy and quick recipes.",
    },
    featured: false,
    published: true,
    seo: {
      metaTitle: "Easy Grainly Cream of Rice Recipes",
      metaDescription:
        "Discover 5 simple and delicious recipes using Grainly Cream of Rice that you can make in minutes.",
      keywords: [
        "grainly recipes",
        "easy cooking",
        "cream of rice",
        "quick meals",
      ],
    },
  },
  {
    title: "Understanding Nutritional Benefits of Rice-Based Products",
    excerpt:
      "Learn about the health benefits and nutritional value of rice-based products like Grainly Cream of Rice.",
    content: `
      <h2>Nutritional Profile of Rice</h2>
      <p>Rice is a staple food that provides essential nutrients and energy. Our Grainly Cream of Rice offers all these benefits in a convenient form.</p>
      
      <h3>Key Nutrients</h3>
      <ul>
        <li><strong>Carbohydrates:</strong> Provides sustained energy</li>
        <li><strong>Protein:</strong> Essential for muscle health</li>
        <li><strong>Fiber:</strong> Supports digestive health</li>
        <li><strong>Vitamins:</strong> B-complex vitamins for energy metabolism</li>
        <li><strong>Minerals:</strong> Iron, magnesium, and zinc</li>
      </ul>
      
      <h3>Health Benefits</h3>
      <p>Regular consumption of rice-based products can support heart health, provide sustained energy, and contribute to overall wellness.</p>
      
      <h3>Why Choose Grainly</h3>
      <p>Our products are made from premium rice and are free from artificial additives, making them a healthy choice for the whole family.</p>
    `,
    category: "Health",
    tags: ["nutrition", "health benefits", "rice", "wellness"],
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=630&fit=crop",
    author: {
      name: "Dr. Emily Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
      bio: "Registered dietitian and nutrition researcher.",
    },
    featured: true,
    published: true,
    seo: {
      metaTitle: "Nutritional Benefits of Rice-Based Products",
      metaDescription:
        "Explore the health benefits and nutritional value of rice-based products like Grainly Cream of Rice.",
      keywords: [
        "rice nutrition",
        "health benefits",
        "nutritional value",
        "grainly",
      ],
    },
  },
];

async function seedBlogs() {
  try {
    await connectDB();

    // Clear existing blogs
    await Blog.deleteMany({});

    // Insert sample blogs
    const blogs = await Blog.insertMany(sampleBlogs);

    console.log("✅ Sample blogs created successfully!");
    console.log(`📝 Created ${blogs.length} blog posts`);

    blogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title} (${blog.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding blogs:", error);
    process.exit(1);
  }
}

seedBlogs();
