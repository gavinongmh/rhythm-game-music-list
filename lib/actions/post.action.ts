"use server";

import mongoose, { FilterQuery } from "mongoose";

import Post, { IPostDoc } from "@/database/post.model";
import TagPost from "@/database/tag-post.model";
import Tag, { ITagDoc } from "@/database/tag.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  EditPostSchema,
  GetPostSchema,
  MakePostSchema,
  PaginatedSearchParamsSchema,
} from "../validations";

export async function makePost(
  params: MakePostParams
): Promise<ActionResponse<IPostDoc>> {
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
      throw new Error("Failed to create post");
    }

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagPostDocuments = [];

    console.log(`Tags Length: ${tags.length}`);

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
    }
    await TagPost.insertMany(tagPostDocuments, { session });

    await Post.findByIdAndUpdate(
      post._id,
      { $push: { tags: { $each: tagIds } } },
      { session }
    );

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
): Promise<ActionResponse<IPostDoc>> {
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
      (tag) =>
        !post.tags.some((t: ITagDoc) =>
          t.name.toLowerCase().includes(tag.toLowerCase())
        )
    );
    const tagsToRemove = post.tags.filter(
      (tag: ITagDoc) =>
        !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
    );

    const newTagDocuments = [];

    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: `^${tag}$`, $options: "i" } },
          { $setOnInsert: { name: tag }, $inc: { posts: 1 } },
          { upsert: true, new: true, session }
        );

        if (existingTag) {
          newTagDocuments.push({
            tag: existingTag._id,
            post: postId,
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
        (tag: mongoose.Types.ObjectId) =>
          !tagIdsToRemove.some((id: mongoose.Types.ObjectId) =>
            id.equals(tag._id)
          )
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

export async function getPosts(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ posts: Post[]; isNext: boolean }>> {
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

  const filterQuery: FilterQuery<typeof Post> = {};

  if (filter === "recommended")
    return { success: true, data: { posts: [], isNext: false } };

  if (query) {
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { content: { $regex: new RegExp(query, "i") } },
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
    const totalPosts = await Post.countDocuments(filterQuery);
    const posts = await Post.find(filterQuery)
      .populate("tags", "name")
      // .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalPosts > skip + posts.length;

    return {
      success: true,
      data: { posts: JSON.parse(JSON.stringify(posts)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
