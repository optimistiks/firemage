export function getComments() {
  return new Promise<{ id: number; title: string }[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "Comment 1" },
        { id: 2, title: "Comment 2" },
        { id: 3, title: "Comment 3" },
      ]);
    }, 3000);
  });
}
