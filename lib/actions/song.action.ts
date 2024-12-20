"use server";

import mongoose, { FilterQuery } from "mongoose";

import Song, { ISongDoc } from "@/database/song.model";
import TagSong from "@/database/tag-song.model";
import Tag, { ITagDoc } from "@/database/tag.model";
import UsageSong from "@/database/usage-song.model";
import Usage, { IUsageDoc } from "@/database/usage.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  EditSongSchema,
  GetSongSchema,
  AddSongSchema,
  PaginatedSearchParamsSchema,
} from "../validations";

export async function addSong(
  params: AddSongParams
): Promise<ActionResponse<ISongDoc>> {
  const validationResult = await action({
    params,
    schema: AddSongSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, notes, tags, usage } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [song] = await Song.create([{ title, notes, author: userId }], {
      session,
    });
    if (!song) {
      throw new Error("Failed to create song");
    }

    const usageIds: mongoose.Types.ObjectId[] = [];
    const usageSongDocuments = [];

    for (const use of usage) {
      const existingUsage = await Usage.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${use}$`, "i") } },
        { $setOnInsert: { name: use }, $inc: { songs: 1 } },
        { upsert: true, new: true, session }
      );

      usageIds.push(existingUsage._id);
      usageSongDocuments.push({
        usage: existingUsage._id,
        song: song._id,
      });
    }
    await UsageSong.insertMany(usageSongDocuments, { session });

    await Song.findByIdAndUpdate(
      song._id,
      { $push: { usage: { $each: usageIds } } },
      { session }
    );

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagSongDocuments = [];

    console.log(`Tags Length: ${tags.length}`);

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { songs: 1 } },
        { upsert: true, new: true, session }
      );

      tagIds.push(existingTag._id);
      tagSongDocuments.push({
        tag: existingTag._id,
        song: song._id,
      });
    }
    await TagSong.insertMany(tagSongDocuments, { session });

    await Song.findByIdAndUpdate(
      song._id,
      { $push: { tags: { $each: tagIds } } },
      { session }
    );

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(song)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function editSong(
  params: EditSongParams
): Promise<ActionResponse<ISongDoc>> {
  const validationResult = await action({
    params,
    schema: EditSongSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, notes, tags, songId, usage } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const song = await Song.findById(songId).populate("tags").populate("usage");

    if (!song) {
      throw new Error("Song not found");
    }

    if (song.author.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    if (song.title !== title || song.notes !== notes) {
      song.title = title;
      song.notes = notes;
      await song.save({ session });
    }

    // ==============================
    // Usage editing
    // ==============================

    const usageToAdd = usage.filter(
      (use) =>
        !song.usage.some((u: IUsageDoc) =>
          u.name.toLowerCase().includes(use.toLowerCase())
        )
    );
    const usageToRemove = song.usage.filter(
      (use: IUsageDoc) =>
        !usage.some((u) => u.toLowerCase() === use.name.toLowerCase())
    );

    const newUsageDocuments = [];

    if (usageToAdd.length > 0) {
      for (const usage of usageToAdd) {
        const existingUsage = await Usage.findOneAndUpdate(
          { name: { $regex: `^${usage}$`, $options: "i" } },
          { $setOnInsert: { name: usage }, $inc: { songs: 1 } },
          { upsert: true, new: true, session }
        );

        if (existingUsage) {
          newUsageDocuments.push({
            tag: existingUsage._id,
            song: songId,
          });

          song.usage.push(existingUsage._id);
        }
      }
    }

    if (usageToRemove.length > 0) {
      const usageIdsToRemove = usageToRemove.map(
        (usage: IUsageDoc) => usage._id
      );

      await Usage.updateMany(
        { _id: { $in: usageIdsToRemove } },
        { $inc: { songs: -1 } },
        { session }
      );

      await UsageSong.deleteMany(
        { usage: { $in: usageIdsToRemove }, song: songId },
        { session }
      );

      song.usage = song.usage.filter(
        (usage: mongoose.Types.ObjectId) =>
          !usageIdsToRemove.some((id: mongoose.Types.ObjectId) =>
            id.equals(usage._id)
          )
      );
    }

    if (newUsageDocuments.length > 0) {
      await UsageSong.insertMany(newUsageDocuments, { session });
    }

    // ==============================
    // Tag editing
    // ==============================

    const tagsToAdd = tags.filter(
      (tag) =>
        !song.tags.some((t: ITagDoc) =>
          t.name.toLowerCase().includes(tag.toLowerCase())
        )
    );
    const tagsToRemove = song.tags.filter(
      (tag: ITagDoc) =>
        !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
    );

    const newTagDocuments = [];

    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: `^${tag}$`, $options: "i" } },
          { $setOnInsert: { name: tag }, $inc: { songs: 1 } },
          { upsert: true, new: true, session }
        );

        if (existingTag) {
          newTagDocuments.push({
            tag: existingTag._id,
            song: songId,
          });

          song.tags.push(existingTag._id);
        }
      }
    }

    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);

      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { songs: -1 } },
        { session }
      );

      await TagSong.deleteMany(
        { tag: { $in: tagIdsToRemove }, song: songId },
        { session }
      );

      song.tags = song.tags.filter(
        (tag: mongoose.Types.ObjectId) =>
          !tagIdsToRemove.some((id: mongoose.Types.ObjectId) =>
            id.equals(tag._id)
          )
      );
    }

    if (newTagDocuments.length > 0) {
      await TagSong.insertMany(newTagDocuments, { session });
    }

    await song.save({ session });
    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(song)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getSong(
  params: GetSongParams
): Promise<ActionResponse<Song>> {
  const validationResult = await action({
    params,
    schema: GetSongSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { songId } = validationResult.params!;

  try {
    const song = await Song.findById(songId).populate("tags").populate("usage");

    if (!song) {
      throw new Error("Song not found");
    }

    return { success: true, data: JSON.parse(JSON.stringify(song)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSongs(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ songs: Song[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<typeof Song> = {};

  if (filter === "recommended")
    return { success: true, data: { songs: [], isNext: false } };

  if (query) {
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { notes: { $regex: new RegExp(query, "i") } },
    ];
  }

  let sortCriteria = {};

  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "unanswered":
      filterQuery.comments = 0;
      sortCriteria = { createdAt: -1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalSongs = await Song.countDocuments(filterQuery);
    const songs = await Song.find(filterQuery)
      .populate("tags", "name")
      .populate("usage", "name")
      .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalSongs > skip + songs.length;

    return {
      success: true,
      data: { songs: JSON.parse(JSON.stringify(songs)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
