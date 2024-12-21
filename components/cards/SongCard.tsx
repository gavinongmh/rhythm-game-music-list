import { PlayIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import ROUTES from "@/constants/routes";
import { songUsageMap } from "@/lib/usageMap";
import { getTimeStamp } from "@/lib/utils";

import TagCard from "./TagCard";
import Metric from "../Metric";

interface Props {
  song: Song;
}

const SongCard = ({
  song: {
    _id,
    title,
    tags,
    usage,
    author,
    artists,
    createdAt,
    upvotes,
    comments,
    views,
  },
}: Props) => {
  return (
    <div className="flex h-16 w-full flex-row overflow-hidden rounded-lg bg-primary-500">
      <div className="text-dark400_light700 relative flex size-16 items-center justify-center">
        <Image width={24} height={24} src="/icons/play.svg" alt="play" />
      </div>
      <div className="relative h-16 w-full overflow-hidden rounded-lg">
        <Image
          fill
          objectFit="cover"
          objectPosition="center"
          src={`${songUsageMap[title.toLowerCase()] ? songUsageMap[title.toLowerCase()] : "/images/mio-satella-full.jpg"}`}
          alt="artist"
        />
        <div className="absolute inset-0 bg-dark-200 opacity-50"></div>
        <div className="relative flex flex-row items-center justify-center px-3 py-1.5 text-light-700">
          <div className="flex w-full flex-col items-start justify-center">
            <p className="sm:h3-semibold base-semibold text-light-900 shadow-dark-200 text-shadow-sm">
              {title}
              <span className="text-xs opacity-80">
                {artists && artists.length > 0 ? " - " + artists[0].name : ""}
              </span>
            </p>
            <div className="flex w-full flex-wrap gap-2">
              {usage.map((use: Usage) => (
                <TagCard
                  key={use._id}
                  _id={use._id}
                  name={use.name}
                  compact
                  isUsage
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* <div className="flex justify-between">
        <Image
          className="rounded-md"
          width={128}
          height={128}
          src="https://yt3.googleusercontent.com/p1VHq6IPD5yI49QDZgNaSeNVIHR2-90go1dUyk_JkVsOwf4IADOqR96oZWFvz-W4UWuzCCDsgg=s160-c-k-c0x00ffffff-no-rj"
          alt="artist"
        />
        <div>
          <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
            <div>
              <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
                {getTimeStamp(createdAt)}
              </span>
              <Link href={ROUTES.SONG(_id)}>
                <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
                  {title}
                </h3>
              </Link>
            </div>
          </div>
          <div className="mt-3.5 flex w-full flex-wrap gap-2">
            {tags.map((tag: Tag) => (
              <TagCard key={tag._id} _id={tag._id} name={tag.name} compact />
            ))}
          </div>
          <div className="flex-between mt-6 w-full flex-wrap gap-3">
            <Metric
              imgUrl={author.image || "/icons/avatar.svg"}
              alt={author.name || "authorName"}
              value={author.name}
              title={`• added ${getTimeStamp(createdAt)}`}
              href={ROUTES.PROFILE(author._id)}
              textStyles="body-medium text-dark400_light700"
              isAuthor
            />
            <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start">
              <Metric
                imgUrl="/icons/like.svg"
                alt="like"
                value={upvotes}
                title=" Votes"
                textStyles="small-medium text-dark400_light800"
              />
              <Metric
                imgUrl="/icons/message.svg"
                alt="comments"
                value={comments}
                title=" Comments"
                textStyles="small-medium text-dark400_light800"
              />
              <Metric
                imgUrl="/icons/eye.svg"
                alt="views"
                value={views}
                title=" Views"
                textStyles="small-medium text-dark400_light800"
              />
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default SongCard;
