import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../get-query-client";
import { PostList } from "./post-list";
import { getPosts } from "@/app/posts/getPosts";

export function Posts() {
  const queryClient = getQueryClient();

  // look ma, no await
  queryClient.prefetchQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });
  console.log("prefetching posts...");

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />
    </HydrationBoundary>
  );
}
