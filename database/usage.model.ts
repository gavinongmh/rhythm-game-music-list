import { Schema, models, model, Document } from "mongoose";

export interface IUsage {
  name:
    | "commercial"
    | "non-commercial"
    | "commercial-official"
    | "non-commercial-official";
  songs: number;
}

export interface IUsageDoc extends IUsage, Document {}

const UsageSchema = new Schema<IUsage>(
  {
    name: {
      type: String,
      enum: [
        "commercial",
        "non-commercial",
        "commercial-official",
        "non-commercial-official",
      ],
      required: true,
      unique: true,
    },
    songs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Usage = models?.Usage || model<IUsage>("Usage", UsageSchema);

export default Usage;
