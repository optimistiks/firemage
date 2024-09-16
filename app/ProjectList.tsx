import { ListProjects } from "@/app/ListProjects";
import { decrypt } from "@/app/session";
import { cookies } from "next/headers";
import { firebase, auth } from "@googleapis/firebase";

export async function ProjectList() {
  console.log("project list render");
  try {
    console.log("retrieving access token from cookies...");
    const { accessToken, scopes } = await decrypt<{
      accessToken: string;
      scopes: string[];
    }>(cookies().get("accessToken")?.value);
    console.log("access token retrieved", { accessToken, scopes });

    const apiAuth = new auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      "http://localhost:3000/google-oauth-redirect"
    );
    apiAuth.setCredentials({ access_token: accessToken });

    const api = firebase({ version: "v1beta1", auth: apiAuth });
    const projects = await api.projects.list();
    console.log("projects", projects);

    return <div>{JSON.stringify(projects.data)}</div>;
  } catch (err) {
    console.log("error retrieving access token from cookies", err);
    return (
      <>
        <ListProjects />
      </>
    );
  }
}
