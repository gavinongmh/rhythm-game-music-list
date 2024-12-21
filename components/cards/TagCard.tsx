import Image from "next/image";
import Link from "next/link";
import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ROUTES from "@/constants/routes";
import { usageTooltipMap } from "@/lib/usageMap";
import { getDeviconClassName } from "@/lib/utils";

import { Badge } from "../ui/badge";

interface Props {
  _id: string;
  name: string;
  songs?: number;
  showCount?: boolean;
  compact?: boolean;
  remove?: boolean;
  isButton?: boolean;
  isUsage?: boolean;
  handleRemove?: () => void;
}

const TagCard = ({
  _id,
  name,
  songs,
  showCount,
  compact,
  isUsage,
  remove,
  isButton,
  handleRemove,
}: Props) => {
  const iconClass = getDeviconClassName(name);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const Content = (
    <>
      {" "}
      <Badge
        className={`subtle-medium text-light400_light500 flex flex-row gap-2 rounded-md border-none px-3 py-1.5 uppercase ${!isUsage ? "background-light800_dark300" : "background-commercial opacity-80"}`}
      >
        <div className="flex-center space-x-2">
          {!isUsage && <i className={`${iconClass} text-sm`}></i>}
          <span>{name}</span>
        </div>
        {remove && (
          <Image
            src="/icons/close.svg"
            width={12}
            height={12}
            alt="close icon"
            className="cursor-pointer object-contain invert-0 dark:invert"
            onClick={handleRemove}
          />
        )}
      </Badge>
      {showCount && (
        <p className="small-medium text-dark500_light700">{songs}</p>
      )}
    </>
  );

  const ButtonContent = (
    <>
      {isButton ? (
        <button onClick={handleClick} className="flex justify-between gap-2">
          {Content}
        </button>
      ) : (
        <Link href={ROUTES.TAG(_id)} className="flex justify-between gap-2">
          {Content}
        </Link>
      )}
    </>
  );
  if (compact) {
    return isUsage && usageTooltipMap[name] ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>{ButtonContent}</TooltipTrigger>
          <TooltipContent>
            <p>{usageTooltipMap[name]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      ButtonContent
    );
  }
};

export default TagCard;
