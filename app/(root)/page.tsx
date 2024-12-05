import Link from "next/link";

import PostCard from "@/components/cards/PostCard";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
const posts = [
  {
    _id: "1",
    title: "How to learn React (Suggestion)?",
    description: "I want to learn React, can anyone help me?",
    tags: [
      { _id: "1", name: "Suggestion" },
      { _id: "2", name: "React" },
    ],
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://media.tenor.com/spyi3PtUrLYAAAAe/muse-swipr-museswipr.png",
    },
    upvotes: 10,
    answers: 5,
    views: 100,
    createdAt: new Date(),
  },
  {
    _id: "2",
    title: "How to learn JavaScript? (Bug)",
    description: "I want to learn JavaScript, can anyone help me?",
    tags: [
      { _id: "1", name: "Bug" },
      { _id: "2", name: "JavaScript" },
    ],
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://media.tenor.com/spyi3PtUrLYAAAAe/muse-swipr-museswipr.png",
    },
    upvotes: 10,
    answers: 5,
    views: 100,
    createdAt: new Date(),
  },
];

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}
const Home = async ({ searchParams }: SearchParams) => {
  const { query = "", filter = "" } = await searchParams;

  const filteredPosts = posts.filter((post) => {
    // Match query against the title
    const matchesQuery = post.title.toLowerCase().includes(query.toLowerCase());

    // Match filter against tags or author name, adjust logic as needed
    const matchesFilter = filter
      ? post.tags.some(
          (tag) => tag.name.toLowerCase() === filter.toLowerCase()
        ) || post.author.name.toLowerCase() === filter.toLowerCase()
      : true; // If no filter is provided, include all questions

    return matchesQuery && matchesFilter;
  });
  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Posts</h1>

        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        >
          <Link href={ROUTES.POST("1")}>Post something!</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search posts..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter />
      <div className="mt-10 flex w-full flex-col gap-6">
        {filteredPosts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </>
  );
};

export default Home;
