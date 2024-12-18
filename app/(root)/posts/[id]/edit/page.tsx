import { notFound, redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import SongForm from "@/components/forms/SongForm";
import ROUTES from "@/constants/routes";
import { getSong } from "@/lib/actions/post.action";

const EditSong = async ({ params }: RouteParams) => {
  const { id } = await params;
  if (!id) return notFound();

  const session = await auth();
  if (!session) return redirect("/sign-in");

  const { data: post, success } = await getSong({ postId: id });
  if (!success) return notFound();

  if (post?.author.toString() !== session?.user?.id) redirect(ROUTES.POST(id));

  return (
    <>
      <SongForm post={post} isEdit />
    </>
  );
};

export default EditSong;
