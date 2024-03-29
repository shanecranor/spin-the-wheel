import { accessToken$ } from "../truffle-sdk";

export async function createViewerEntry(text: string) {
  try {
    const accessToken = accessToken$.get();
    console.log(accessToken);
    if (typeof accessToken !== "string") {
      alert("error getting access token");
    }
    const response = await fetch(
      `https://wheel-entry-worker.shanecranor.workers.dev/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken$.get()}`,
        },
        body: JSON.stringify({ text }),
      }
    );
    if (!response.ok) {
      return response.statusText;
    }
    return true;
  } catch (error) {
    return false;
  }
}
