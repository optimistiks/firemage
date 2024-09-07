import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../get-query-client";
import { getComments } from "@/app/posts/getComments";
import { CommentList } from "@/app/posts/comment-list";

export function Comments() {
  const queryClient = getQueryClient();

  // look ma, no await
  queryClient.prefetchQuery({
    queryKey: ["posts-comments"],
    queryFn: getComments,
  });
  console.log("prefetching comments...");

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CommentList />
    </HydrationBoundary>
  );
}
