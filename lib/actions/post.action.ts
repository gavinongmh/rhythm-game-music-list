"use server";

import mongoose from "mongoose";

import Post from "@/database/post.model";
import TagPost from "@/database/tag-post.model";
import Tag from "@/database/tag.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { MakePostSchema } from "../validations";

export async function makePost(
  params: CreatePostParams
): Promise<ActionResponse<Post>> {
  const validationResult = await action({
    params,
    schema: MakePostSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [post] = await Post.create([{ title, content, author: userId }], {
      session,
    });
    if (!post) {
      throw new Error("Failer to create post");
    }

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagPostDocuments = [];

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { posts: 1 } },
        { upsert: true, new: true, session }
      );

      tagIds.push(existingTag._id);
      tagPostDocuments.push({
        tag: existingTag._id,
        post: post._id,
      });

      await TagPost.insertMany(tagPostDocuments, { session });

      await Post.findByIdAndUpdate(
        post._id,
        { $push: { tags: { $each: tagIds } } },
        { session }
      );
    }

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(post)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
