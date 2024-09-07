"use client";

import { getComments } from "@/app/posts/getComments";
import { useSuspenseQuery } from "@tanstack/react-query";

export function CommentList() {
  const { data } = useSuspenseQuery({
    queryKey: ["posts-comments"],
    queryFn: getComments,
  });
  return (
    <>
      <div>Comment List</div>
      {data.map((comment) => (
        <div key={comment.id}>{comment.title}</div>
      ))}
    </>
  );
}
