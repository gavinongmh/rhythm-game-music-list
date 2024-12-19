import { Schema, models, model, Types, Document } from "mongoose";

export interface IArtistSong {
  artist: Types.ObjectId;
  song: Types.ObjectId;
}

export interface IArtistSongDoc extends IArtistSong, Document {}

const ArtistSongSchema = new Schema<IArtistSong>(
  {
    artist: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    song: { type: Schema.Types.ObjectId, ref: "Song", required: true },
  },
  { timestamps: true }
);

const ArtistSong =
  models?.ArtistSong || model<IArtistSong>("ArtistSong", ArtistSongSchema);

export default ArtistSong;
