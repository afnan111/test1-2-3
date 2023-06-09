import { Request, Response } from 'express';
import { BlogPostService } from './blog_post.service';

export class BlogPostController {
  constructor(private readonly blogPostService: BlogPostService) {}

  async createBlogPost(req: Request, res: Response): Promise<void> {
    try {
      const blogPost = req.body;
      const createdBlogPost = await this.blogPostService.createBlogPost(blogPost);
      res.json(createdBlogPost);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
 
}
