import ROUTES from "./routes";

export const DEFAULT_EMPTY = {
  title: "No Data Found",
  message:
    "Looks like the database is taking a nap. Wake it up with some new entries.",
  button: {
    text: "Add Data",
    href: ROUTES.HOME,
  },
};

export const DEFAULT_ERROR = {
  title: "Something Went Wrong",
  message: "Even our code can have a bad day. Give it another shot.",
  button: {
    text: "Retry Request",
    href: ROUTES.HOME,
  },
};

export const EMPTY_POST = {
  title: "Ahh, No Posts Yet!",
  message: "No posts found. Maybe you should make one!",
  button: {
    text: "Ask a Post",
    href: ROUTES.MAKE_POST,
  },
};

export const EMPTY_TAGS = {
  title: "No Tags Found",
  message: "The tag cloud is empty. Add some keywords to make it rain.",
  button: {
    text: "Create Tag",
    href: ROUTES.TAGS,
  },
};

export const EMPTY_COLLECTIONS = {
  title: "Collections Are Empty",
  message:
    "Looks like you haven’t created any collections yet. Start curating something extraordinary today",
  button: {
    text: "Save to Collection",
    href: ROUTES.COLLECTION,
  },
};
