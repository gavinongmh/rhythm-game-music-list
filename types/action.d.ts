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

interface AddSongParams {
  title: string;
  notes: string;
  tags: string[];
  usage: (
    | "commercial"
    | "non-commercial"
    | "commercial-official"
    | "non-commercial-official"
  )[];
}

interface EditSongParams extends AddSongParams {
  songId: string;
}

interface GetSongParams {
  songId: string;
}
