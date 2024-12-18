const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  COMUNITY: "/community",
  COLLECTION: "/collection",
  MAPPERS: "/mappers",
  MAKE_POST: "make-post",
  JOBS: "/jobs",
  TAGS: "/tags",
  TAG: (id: string) => `/tags/${id}`,
  PROFILE: (id: string) => `/profile/${id}`,
  POST: (id: string) => `/songs/${id}`,
  SIGN_IN_WITH_OAUTH: "signin-with-oauth",
};

export default ROUTES;
