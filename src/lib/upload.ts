export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  });

  let data: { error?: string; url?: string };
  try {
    data = await res.json();
  } catch {
    throw new Error(`Upload failed (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.error || `Upload failed (${res.status})`);
  }

  if (!data.url) {
    throw new Error("Upload failed: no URL returned");
  }

  return data.url;
}

export async function uploadMediaFile(file: File): Promise<string> {
  return uploadFile(file);
}
