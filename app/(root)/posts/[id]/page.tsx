import React from "react";

const PostDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  return <div>Post Page: {id}</div>;
};

export default PostDetails;
