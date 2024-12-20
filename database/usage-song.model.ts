import { Schema, models, model, Types, Document } from "mongoose";

export interface IUsageSong {
  usage: Types.ObjectId;
  song: Types.ObjectId;
}

export interface IUsageSongDoc extends IUsageSong, Document {}

const UsageSongSchema = new Schema<IUsageSong>(
  {
    usage: { type: Schema.Types.ObjectId, ref: "Usage", required: true },
    song: { type: Schema.Types.ObjectId, ref: "Song", required: true },
  },
  { timestamps: true }
);

const UsageSong =
  models?.UsageSong || model<IUsageSong>("UsageSong", UsageSongSchema);

export default UsageSong;
