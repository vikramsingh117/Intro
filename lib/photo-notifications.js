// Server-only: the unguessable topic must never be exposed in browser bundles or API responses.
export async function notifyPhotoUpload(id) {
  const topic = process.env.NTFY_PHOTO_TOPIC;
  if (!topic) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch('https://ntfy.sh/', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        title: 'After Hours: new photo',
        message: 'Someone uploaded a photo to your portfolio. Tap to view it.',
        tags: ['camera'],
        click: `https://vikram-singh.vercel.app/api/photos?id=${encodeURIComponent(id)}`,
      }),
    });
    if (!response.ok) console.warn('Photo alert delivery failed:', response.status);
    await response.body?.cancel();
  } catch {
    // Notification outages must not turn a successfully saved photo into a failed upload.
    console.warn('Photo alert delivery unavailable.');
  } finally {
    clearTimeout(timeout);
  }
}
