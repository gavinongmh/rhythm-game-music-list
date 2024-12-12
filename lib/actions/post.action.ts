"use server";

import mongoose from "mongoose";

import Post from "@/database/post.model";
import TagPost from "@/database/tag-post.model";
import Tag, { ITagDoc } from "@/database/tag.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { EditPostSchema, GetPostSchema, MakePostSchema } from "../validations";

export async function makePost(
  params: MakePostParams
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

export async function editPost(
  params: EditPostParams
): Promise<ActionResponse<Post>> {
  const validationResult = await action({
    params,
    schema: EditPostSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, postId } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const post = await Post.findById(postId).populate("tags");

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.author.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    if (post.title !== title || post.content !== content) {
      post.title = title;
      post.content = content;
      await post.save({ session });
    }

    const tagsToAdd = tags.filter(
      (tag) => !post.tags.includes(tag.toLowerCase())
    );
    const tagsToRemove = post.tags.filter(
      (tag: ITagDoc) => !tags.includes(tag.name.toLowerCase())
    );

    const newTagDocuments = [];

    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, "i") } },
          { $setOnInsert: { name: tag }, $inc: { posts: 1 } },
          { upsert: true, new: true, session }
        );

        if (existingTag) {
          newTagDocuments.push({
            tag: existingTag._id,
            post: post._id,
          });

          post.tags.push(existingTag._id);
        }
      }
    }

    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);

      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { posts: -1 } },
        { session }
      );

      await TagPost.deleteMany(
        { tag: { $in: tagIdsToRemove }, post: postId },
        { session }
      );

      post.tags = post.tags.filter(
        (tagId: mongoose.Types.ObjectId) => !tagsToRemove.includes(tagId)
      );
    }

    if (newTagDocuments.length > 0) {
      await TagPost.insertMany(newTagDocuments, { session });
    }

    await post.save({ session });
    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(post)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getPost(
  params: GetPostParams
): Promise<ActionResponse<Post>> {
  const validationResult = await action({
    params,
    schema: GetPostSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { postId } = validationResult.params!;

  try {
    const post = await Post.findById(postId).populate("tags");

    if (!post) {
      throw new Error("Post not found");
    }

    return { success: true, data: JSON.parse(JSON.stringify(post)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
