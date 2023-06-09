import { Document, Schema, model } from 'mongoose';

export interface BlogPost extends Document {
  title: string;
  description: string; 
}

const blogPostSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
 
});

export const BlogPostModel = model<BlogPost>('BlogPost', blogPostSchema);
