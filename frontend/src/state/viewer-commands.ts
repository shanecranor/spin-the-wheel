import { accessToken$ } from "../truffle-sdk";

export async function createViewerEntry(text: string) {
  const accessToken = accessToken$.get();
  if (accessToken instanceof Promise) {
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
    return false;
  }
  return true;
}
