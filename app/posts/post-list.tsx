"use client";

import { getPosts } from "@/app/posts/getPosts";
import { useSuspenseQuery } from "@tanstack/react-query";

export function PostList() {
  const { data } = useSuspenseQuery({ queryKey: ["posts"], queryFn: getPosts });
  return (
    <>
      <div>Post List</div>
      {data.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </>
  );
}
