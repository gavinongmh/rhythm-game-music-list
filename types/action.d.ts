interface SignInWithOAuthParams {
  provider: "github" | "google";
  providerAccountId: string;
  user: {
    email: string;
    name: string;
    image: string;
    username: string;
  };
}

interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface MakeSongParams {
  title: string;
  content: string;
  tags: string[];
}

interface EditSongParams extends MakeSongParams {
  postId: string;
}

interface GetSongParams {
  postId: string;
}
