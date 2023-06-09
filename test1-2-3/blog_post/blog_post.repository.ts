import { BlogPost } from './blog_post.entity';
import { BlogPostDTO } from './blog_post.dto';
import { BlogPostModel } from './blog_post.entity';

export interface BlogPostRepository {
  create(blogPost: BlogPostDTO): Promise<BlogPost>;
 
}

export class MongoBlogPostRepository implements BlogPostRepository {
  async create(blogPost: BlogPostDTO): Promise<BlogPost> {
    const createdBlogPost = await BlogPostModel.create(blogPost);
    return createdBlogPost;
  }
 
}
