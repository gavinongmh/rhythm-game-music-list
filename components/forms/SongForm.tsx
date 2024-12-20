"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { ReloadIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import ROUTES from "@/constants/routes";
import { toast } from "@/hooks/use-toast";
import { editSong, addSong } from "@/lib/actions/song.action";
import { AddSongSchema } from "@/lib/validations";

import TagCard from "../cards/TagCard";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const Editor = dynamic(() => import("@/components/editor"), {
  // Make sure we turn SSR off
  ssr: false,
});

interface Params {
  song?: Song;
  isEdit?: boolean;
}

const usageOptions = [
  "non-commercial",
  "non-commercial-official",
  "commercial",
  "commercial-official",
];

const SongForm = ({ song, isEdit = false }: Params) => {
  const router = useRouter();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AddSongSchema>>({
    resolver: zodResolver(AddSongSchema),
    defaultValues: {
      title: song?.title || "",
      notes: song?.notes || "",
      usage: song?.usage.map((use) => use.name) || [],
      tags: song?.tags.map((tag) => tag.name) || [],
      artists: song?.artists.map((artist) => artist.name) || [],
    },
  });

  const handleInputKeyDown = (
    param: keyof z.infer<typeof AddSongSchema>,
    e: React.KeyboardEvent<HTMLInputElement>,
    field: { value: string[] }
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.currentTarget.value.trim();
      if (input && input.length < 15 && !field.value.includes(input)) {
        form.setValue(param, [...field.value, input]);
        e.currentTarget.value = "";
        form.clearErrors(param);
      } else if (input.length > 15) {
        form.setError(param, {
          type: "manual",
          message: "Tag should be less than 15 characters",
        });
      } else if (field.value.includes(input)) {
        form.setError(param, {
          type: "manual",
          message: "Tag already exists",
        });
      }
    }
  };

  const handleTagRemove = (tag: string, field: { value: string[] }) => {
    const newTags = field.value.filter((t) => t !== tag);

    form.setValue("tags", newTags);

    if (newTags.length === 0) {
      form.setError("tags", {
        type: "manual",
        message: "Tags are required",
      });
    }
  };

  const handleArtistRemove = (artist: string, field: { value: string[] }) => {
    const newArtists = field.value.filter((t) => t !== artist);

    form.setValue("artists", newArtists);

    if (newArtists.length === 0) {
      form.setError("artists", {
        type: "manual",
        message: "Artists are required",
      });
    }
  };

  const handleAddSong = async (data: z.infer<typeof AddSongSchema>) => {
    startTransition(async () => {
      if (isEdit && song) {
        const result = await editSong({ songId: song?._id, ...data });
        if (result.success) {
          toast({
            title: "Success",
            description: "Song updated successfully",
          });
          if (result.data) {
            router.push(ROUTES.SONG(result.data._id as string));
          } else {
            toast({
              title: `Error ${result.status}`,
              description: result.error?.message || "Something went wrong",
              variant: "destructive",
            });
          }
        }

        return;
      }
      const result = await addSong(data);

      if (result.success) {
        toast({
          title: "Success",
          description: "Song created successfully",
        });
        if (result.data) {
          router.push(ROUTES.SONG(result.data._id as string));
        } else {
          toast({
            title: `Error ${result.status}`,
            description: result.error?.message || "Something went wrong",
            variant: "destructive",
          });
        }
      }
    });
  };
  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-10"
        onSubmit={form.handleSubmit(handleAddSong)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Song Title <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                  {...field}
                />
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Please be specific and keep the title relevant to the song!
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="artists"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Artists <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <div>
                  <Input
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                    placeholder="Add artists..."
                    onKeyDown={(e) => handleInputKeyDown("artists", e, field)}
                  />
                  {field.value.length > 0 && (
                    <div className="flex-start mt-2.5 flex-wrap gap-2.5">
                      {field?.value?.map((artist: string) => (
                        <TagCard
                          key={artist}
                          _id={artist}
                          name={artist}
                          compact
                          remove
                          isButton
                          handleRemove={() => handleArtistRemove(artist, field)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Add the song&apos;s artists. Press enter to add an artist.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usage"
          render={() => {
            return (
              <FormItem className="flex w-full flex-col gap-3">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Usage <span className="text-primary-500">*</span>
                </FormLabel>
                {usageOptions.map((use) => (
                  <FormField
                    key={use}
                    control={form.control}
                    name="usage"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={use}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              className="data-[state=checked]:bg-primary-500 data-[state=checked]:text-light-800
                              dark:data-[state=checked]:bg-primary-500 dark:data-[state=checked]:text-light-800"
                              checked={field.value?.includes(use)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, use])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== use
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{use}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Official use allows songs to be included within the
                  game&apos;s files.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Tags <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <div>
                  <Input
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                    placeholder="Add tags..."
                    onKeyDown={(e) => handleInputKeyDown("tags", e, field)}
                  />
                  {field.value.length > 0 && (
                    <div className="flex-start mt-2.5 flex-wrap gap-2.5">
                      {field?.value?.map((tag: string) => (
                        <TagCard
                          key={tag}
                          _id={tag}
                          name={tag}
                          compact
                          remove
                          isButton
                          handleRemove={() => handleTagRemove(tag, field)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Add up to 3 tags to describe what the post is about. Press enter
                to add a tag.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Song notes <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Editor
                  value={field.value}
                  editorRef={editorRef}
                  fieldChange={field.onChange}
                />
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                What is your song about?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-16 flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="primary-gradient w-fit !text-light-900"
          >
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 size-4 animate-spin" />
                <span>Submitting</span>
              </>
            ) : (
              <>{isEdit ? "Edit" : "Add Song"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SongForm;
