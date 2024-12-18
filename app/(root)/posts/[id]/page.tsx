import React from "react";

const SongDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  return <div>Song Page: {id}</div>;
};

export default SongDetails;
