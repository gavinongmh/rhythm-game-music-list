import { Schema, models, model, Types, Document } from "mongoose";

export interface ITagSong {
  tag: Types.ObjectId;
  song: Types.ObjectId;
}

export interface ITagSongDoc extends ITagSong, Document {}

const TagSongSchema = new Schema<ITagSong>(
  {
    tag: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
    song: { type: Schema.Types.ObjectId, ref: "Song", required: true },
  },
  { timestamps: true }
);

const TagSong = models?.TagSong || model<ITagSong>("TagSong", TagSongSchema);

export default TagSong;
