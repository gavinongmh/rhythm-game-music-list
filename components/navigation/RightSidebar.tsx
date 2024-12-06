import Image from "next/image";
import Link from "next/link";
import React from "react";

import ROUTES from "@/constants/routes";

import TagCard from "../cards/TagCard";

const hotPosts = [
  { _id: "1", title: "How to get a map pack approved?" },
  { _id: "2", title: "Mapping tips and tricks?" },
  { _id: "3", title: "How to clear harder maps?" },
  { _id: "4", title: "What is circle swiping?" },
  { _id: "5", title: "Mouse or tablet?" },
];

const popularTags = [
  { _id: "1", name: "Suggestion", questions: 100 },
  { _id: "2", name: "Mapping", questions: 200 },
  { _id: "3", name: "Gameplay", questions: 150 },
  { _id: "4", name: "Bug", questions: 50 },
  { _id: "5", name: "Feedback", questions: 75 },
];

const RightSidebar = () => {
  return (
    <section className="background-light900_dark200 light-border custom-scrollbar sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Posts</h3>

        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotPosts.map(({ _id, title }) => (
            <Link
              key={_id}
              href={ROUTES.PROFILE(_id)}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">{title}</p>

              <Image
                src="/icons/chevron-right.svg"
                alt="Chevron"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map(({ _id, name, questions }) => (
            <TagCard
              key={_id}
              _id={_id}
              name={name}
              questions={questions}
              showCount
              compact
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
