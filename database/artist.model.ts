import { Schema, models, model, Document } from "mongoose";

export interface IArtist {
  name: string;
  songs: number;
  image?: string;
}

export interface IArtistDoc extends IArtist, Document {}

// TBD: Add aliases
const ArtistSchema = new Schema<IArtist>(
  {
    name: { type: String, required: true, unique: true },
    songs: { type: Number, default: 0 },
    image: { type: String },
  },
  { timestamps: true }
);

const Artist = models?.Artist || model<IArtist>("Artist", ArtistSchema);

export default Artist;
