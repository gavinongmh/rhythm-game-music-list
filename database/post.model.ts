import { Schema, models, model, Types, Document } from "mongoose";

export interface IPost {
  title: string;
  content: string;
  tags: Types.ObjectId[];
  views: number;
  comments: number;
  upvotes: number;
  downvotes: number;
  author: Types.ObjectId;
}

export interface IPostDoc extends IPost, Document {}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Post = models?.Post || model<IPost>("Post", PostSchema);

export default Post;
