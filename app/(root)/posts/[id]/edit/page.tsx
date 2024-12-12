import { notFound, redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import PostForm from "@/components/forms/PostForm";
import ROUTES from "@/constants/routes";
import { getPost } from "@/lib/actions/post.action";

const EditPost = async ({ params }: RouteParams) => {
  const { id } = await params;
  if (!id) return notFound();

  const session = await auth();
  if (!session) return redirect("/sign-in");

  const { data: post, success } = await getPost({ postId: id });
  if (!success) return notFound();

  if (post?.author.toString() !== session?.user?.id) redirect(ROUTES.POST(id));

  return (
    <>
      <PostForm post={post} isEdit />
    </>
  );
};

export default EditPost;
