import Link from "next/link";

import SongCard from "@/components/cards/SongCard";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import { getSongs } from "@/lib/actions/song.action";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_POST } from "@/constants/states";

// const test = async () => {
//   try {
//     return await api.users.getAll();
//   } catch (error) {
//     return handleError(error);
//   }
// };

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}
const Home = async ({ searchParams }: SearchParams) => {
  // const users = await test();
  // console.log(users);

  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getSongs({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  const { songs } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Songs</h1>

        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        >
          <Link href={ROUTES.ADD_SONG}>Add a Song</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search songs..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter />

      <DataRenderer
        success={success}
        error={error}
        data={songs}
        empty={EMPTY_POST}
        render={(songs) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {songs.map((song) => (
              <SongCard key={song._id} song={song} />
            ))}
          </div>
        )}
      />
    </>
  );
};

export default Home;
