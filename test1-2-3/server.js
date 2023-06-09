const express = require('express');
const multer = require('multer');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');
import blogPostRoutes from './routes/blog_post.routes';
 
const app = express();
app.use(express.json());

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Helper function to validate the inputs
function validateInputs(req, res, next) {
  const { title, description, main_image, additional_images, date_time } = req.body;

  if (!title || title.length < 5 || title.length > 50 || /[^a-zA-Z0-9\s]/.test(title)) {
    return res.status(400).json({ error: 'Title is required and should be 5 to 50 characters long without special characters.' });
  }

  if (!description || description.length > 500) {
    return res.status(400).json({ error: 'Description is required and should be less than or equal to 500 characters.' });
  }

  if (!main_image || !main_image.mimetype.includes('image/') || main_image.size > 1000000) {
    return res.status(400).json({ error: 'Main image is required, should be in JPG format, and should not exceed 1MB in size.' });
  }

  if (additional_images) {
    if (!Array.isArray(additional_images) || additional_images.length > 5) {
      return res.status(400).json({ error: 'Additional images should be an array with a maximum of 5 images.' });
    }

    for (let i = 0; i < additional_images.length; i++) {
      const image = additional_images[i];
      if (!image.mimetype.includes('image/') || image.size > 1000000) {
        return res.status(400).json({ error: 'Additional images should be in JPG format and should not exceed 1MB in size.' });
      }
    }
  }

  if (!date_time || date_time < Date.now()) {
    return res.status(400).json({ error: 'Invalid date and time. It should be a UNIX timestamp and not before the current time.' });
  }

  next();
}

app.use('/api/v1/blogPosts', blogPostRoutes);
// Add blog post API
app.post('/add-blog', upload.fields([{ name: 'main_image', maxCount: 1 }, { name: 'additional_images', maxCount: 5 }]), validateInputs, (req, res) => {
  // Compression logic goes here

  // Save images and get their paths
  const mainImagePath = req.files['main_image'][0].path;
  const additionalImagePaths = req.files['additional_images'] ? req.files['additional_images'].map((file) => file.path) : [];

  // Remove temporary files used while compression
 
  const blogs = JSON.parse(fs.readFileSync('blogs.json'));
  const referenceNumber = blogs.length > 0 ? blogs[blogs.length - 1].referenceNumber + 1 : 1;
 
 
const newBlog = {
  title: req.body.title,
  description: req.body.description,
  main_image: mainImagePath,
  additional_images: additionalImagePaths,
  date_time: req.body.date_time,
  referenceNumber: referenceNumber,
};

blogs.push(newBlog);
fs.writeFileSync('blogs.json', JSON.stringify(blogs));
 
res.json(newBlog);
});

// Get all blog posts API
app.get('/blogs', (req, res) => { 
  const blogs = JSON.parse(fs.readFileSync('blogs.json'));
 
  const formattedBlogs = blogs.map((blog) => ({
    ...blog,
    date_time: new Date(blog.date_time).toISOString(),
    title_slug: slugify(blog.title, { lower: true, remove: /[*+~.()'"!:@]/g }),
  }));
 
  res.json(formattedBlogs);
});
 
app.get('/generate-token', (req, res) => {
  const { image_path } = req.query;

  // Generate a token that will expire after 5 minutes for the provided image_path
  const token = generateToken(image_path, 5 * 60); // 5 minutes expiration time

  res.json({ token });
});

// Get image by token API
app.get('/image', (req, res) => {
  const { image_path, token } = req.query;

  // Check if the token is valid (not expired and matches the image_path)
  if (!isValidToken(token, image_path)) {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  // Send back the image in a way that the browser can display it
  res.sendFile(path.join(__dirname, image_path));
});

// Helper function to generate a token
function generateToken(imagePath, expirationTime) {
  // Generate a token based on imagePath and expirationTime (using a JWT library, for example)

  // For demonstration purposes, here's a simple implementation using a unique identifier
  const token = `${imagePath}-${Date.now()}-${Math.random()}`;
  setTimeout(() => {
    // Token expiration logic (remove token from cache or invalidate it)
    // For example, you can use a cache library like Redis and remove the token from cache
    console.log(`Token expired: ${token}`);
  }, expirationTime * 1000); // Convert expirationTime to milliseconds

  return token;
}

// Helper function to validate a token
function isValidToken(token, imagePath) {
  // Validate the token against the provided imagePath (using a JWT library, for example)
 
  return token.includes(imagePath);
}

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
