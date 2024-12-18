import { Schema, models, model, Types, Document } from "mongoose";

export interface ITagSong {
  tag: Types.ObjectId;
  post: Types.ObjectId;
}

export interface ITagQuestionDoc extends ITagSong, Document {}

const TagSongSchema = new Schema<ITagSong>(
  {
    tag: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Song", required: true },
  },
  { timestamps: true }
);

const TagSong = models?.TagSong || model<ITagSong>("TagSong", TagSongSchema);

export default TagSong;
