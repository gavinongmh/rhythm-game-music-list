import ROUTES from "./routes";

export const sidebarLinks = [
  {
    imgURL: "/icons/home.svg",
    route: ROUTES.HOME,
    label: "Home",
  },
  {
    imgURL: "/icons/users.svg",
    route: ROUTES.COMUNITY,
    label: "Community",
  },
  {
    imgURL: "/icons/star.svg",
    route: ROUTES.COLLECTION,
    label: "Collections",
  },
  {
    imgURL: "/icons/suitcase.svg",
    route: ROUTES.MAPPERS,
    label: "Maps",
  },
  {
    imgURL: "/icons/tag.svg",
    route: ROUTES.TAGS,
    label: "Tags",
  },
  {
    imgURL: "/icons/user.svg",
    route: "/profile",
    label: "Profile",
  },
  {
    imgURL: "/icons/question.svg",
    route: ROUTES.POST("1"),
    label: "Songs",
  },
];
