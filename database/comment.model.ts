import { model, models, Schema, Types } from "mongoose";

export interface IComment {
  author: Types.ObjectId;
  post: Types.ObjectId;
  content: string;
  upvotes: number;
  downvotes: number;
}

const CommentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Comment = models?.Account || model<IComment>("Account", CommentSchema);

export default Comment;
