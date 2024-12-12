import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import PostForm from "@/components/forms/PostForm";

const Post = async () => {
  const session = await auth();
  if (!session) return redirect("/sign-in");
  return (
    <>
      <h1 className="h1-bold text-dark100_light900"> Make a post</h1>
      <div className="mt-9">
        <PostForm />
      </div>
    </>
  );
};

export default Post;
