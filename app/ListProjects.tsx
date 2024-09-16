"use client";

import { listProjects } from "@/app/actions";

export function ListProjects() {
  console.log("list projects render");
  return <button onClick={() => listProjects()}>List Projects</button>;
}
