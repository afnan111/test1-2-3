import { BlogPostDTO } from './blog_post.dto';
import { BlogPostRepository } from '../../blog_post/blog_post.repository';

export class BlogPostService {
  constructor(private readonly blogPostRepository: BlogPostRepository) {}

  async createBlogPost(blogPost: BlogPostDTO): Promise<BlogPostDTO> {
    // Validate the blog post using Joi schema
    const { error, value } = blogPostSchema.validate(blogPost);
    if (error) {
      throw new Error(error.details[0].message);
    }
 
    const createdBlogPost = await this.blogPostRepository.create(value);

    return createdBlogPost;
  }
 
}
