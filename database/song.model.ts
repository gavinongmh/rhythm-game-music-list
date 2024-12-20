import { Schema, models, model, Types, Document } from "mongoose";

export interface ISong {
  title: string;
  notes: string;
  tags: Types.ObjectId[];
  usage: Types.ObjectId[];
  views: number;
  comments: number;
  upvotes: number;
  downvotes: number;
  author: Types.ObjectId;
}

export interface ISongDoc extends ISong, Document {}

const SongSchema = new Schema<ISong>(
  {
    title: { type: String, required: true },
    notes: { type: String, required: true },
    usage: [{ type: Schema.Types.ObjectId, ref: "Usage" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Song = models?.Song || model<ISong>("Song", SongSchema);

export default Song;
