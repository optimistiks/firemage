"use client";

import { listProjects } from "@/app/list-projects";

export function ListProjects() {
  return <button onClick={() => listProjects()}>List Projects</button>;
}
