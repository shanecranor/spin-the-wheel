export async function createViewerEntry(text: string, accessToken: string) {
  const response = await fetch(
    `https://wheel-entry-worker.shanecranor.workers.dev`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
    }
  );
  if (!response.ok) {
    return false;
  }
  return true;
}
