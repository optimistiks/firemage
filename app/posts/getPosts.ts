export function getPosts() {
  return new Promise<{ id: number; title: string }[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "Post 1" },
        { id: 2, title: "Post 2" },
        { id: 3, title: "Post 3" },
      ]);
    }, 5000);
  });
}
