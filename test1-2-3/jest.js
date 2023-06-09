const request = require('supertest');
const fs = require('fs');
const app = require('./src/app');  

describe('Add blog post API', () => {
  test('should add a valid blog post with all fields and match the sent fields', async () => {
    const response = await request(app)
      .post('/add-blog')
      .field('title', 'My Blog Post')
      .field('description', 'This is my blog post description.')
      .attach('main_image', 'test-images/main.jpg')
      .field('date_time', Date.now());

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe('My Blog Post');
    expect(response.body.description).toBe('This is my blog post description.');
  
  });

  test('should return an error when adding a blog post with missing required fields', async () => {
    const response = await request(app)
      .post('/add-blog')
      .field('title', 'My Blog Post') 

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Description is required and should be less than or equal to 500 characters.');
  });

  test('should return an error when adding a blog post with main image exceeding 1MB', async () => {
    const response = await request(app)
      .post('/add-blog')
      .field('title', 'My Blog Post')
      .field('description', 'This is my blog post description.')
      .attach('main_image', 'test-images/large_image.jpg')
      .field('date_time', Date.now());

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Main image is required, should be in JPG format, and should not exceed 1MB in size.');
  });

  test('should return an error when adding a blog post with title containing special characters', async () => {
    const response = await request(app)
      .post('/add-blog')
      .field('title', 'My Blog Post!')
      .field('description', 'This is my blog post description.')
      .attach('main_image', 'test-images/main.jpg')
      .field('date_time', Date.now());

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      'Title is required and should be 5 to 50 characters long without special characters.'
    );
  });

  test('should return an error when adding a blog post with non-UNIX timestamp date_time', async () => {
    const response = await request(app)
      .post('/add-blog')
      .field('title', 'My Blog Post')
      .field('description', 'This is my blog post description.')
      .attach('main_image', 'test-images/main.jpg')
      .field('date_time', new Date().toISOString()); // Using ISO string instead of UNIX timestamp

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid date and time. It should be a UNIX timestamp and not before the current time.');
  });
});

describe('Get all blog posts API', () => {
  beforeEach(() => { 
    const testData = [
      { title: 'Blog 1', description: 'This is blog 1.', main_image: 'test-images/main.jpg', date_time: Date.now() },
      { title: 'Blog 2', description: 'This is blog 2.', main_image: 'test-images/main.jpg', date_time: Date.now() },
    ];

    fs.writeFileSync('blogs.json', JSON.stringify(testData));
  });

  test('should retrieve all blog posts and format date_time and title_slug', async () => {
    const response = await request(app).get('/blogs');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].date_time).toBeDefined(); // Check if date_time field is formatted
    expect(response.body[0].title_slug).toBeDefined(); // Check if title_slug field is added
  });
});

describe('Token-based image access APIs', () => {
  let token;

  beforeAll(async () => {
    // Generate a token for a test image
    const response = await request(app).get('/generate-token?image_path=test-images/main.jpg');
    token = response.body.token;
  });

  test('should successfully retrieve an image using a valid token', async () => {
    const response = await request(app).get('/image?image_path=test-images/main.jpg&token=' + token);

    expect(response.statusCode).toBe(200); 
  });

  test('should return an error when retrieving an image using an invalid token', async () => {
    const response = await request(app).get('/image?image_path=test-images/main.jpg&token=invalidtoken');

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('Invalid token.');
  });
});
