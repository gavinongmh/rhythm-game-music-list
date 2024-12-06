import React from "react";

import PostForm from "@/components/forms/PostForm";

const Post = () => {
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
