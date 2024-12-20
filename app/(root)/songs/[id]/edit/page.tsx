import { notFound, redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import SongForm from "@/components/forms/SongForm";
import ROUTES from "@/constants/routes";
import { getSong } from "@/lib/actions/song.action";

const EditSong = async ({ params }: RouteParams) => {
  const { id } = await params;
  if (!id) return notFound();

  const session = await auth();
  if (!session) return redirect("/sign-in");

  const { data: song, success } = await getSong({ songId: id });
  if (!success) return notFound();

  if (song?.author.toString() !== session?.user?.id) redirect(ROUTES.SONG(id));

  return (
    <>
      <SongForm song={song} isEdit />
    </>
  );
};

export default EditSong;
