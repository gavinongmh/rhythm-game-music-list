interface Tag {
  _id: string;
  name: string;
}

interface Usage {
  _id: string;
  name:
    | "commercial"
    | "non-commercial"
    | "commercial-official"
    | "non-commercial-official";
}

interface Artist {
  _id: string;
  name: string;
  image: string;
}

interface Author {
  _id: string;
  name: string;
  image: string;
}

interface Song {
  _id: string;
  title: string;
  notes: string;
  image: string;
  tags: Tag[];
  artists: Artist[];
  usage: Usage[];
  author: Author;
  createdAt: Date;
  upvotes: number;
  comments: number;
  views: number;
}

type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};

type SuccessResponse<T = null> = ActionResponse<T> & { success: true };

type ErrorResponse = ActionResponse<undefined> & { success: false };

type APIErrorResponse = NextResponse<ErrorResponse>;

type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface PaginatedSearchParams {
  page?: number;
  pageSize?: number;
  query?: string;
  filter?: string;
  sort?: string;
}

type UsageOption =
  | "commercial"
  | "non-commercial"
  | "commercial-official"
  | "non-commercial-official";
