// Server-only: the unguessable topic must never be exposed in browser bundles or API responses.
async function sendNotification(payload) {
  const topic = process.env.NTFY_PHOTO_TOPIC;
  if (!topic) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch('https://ntfy.sh/', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({topic,...payload}),
    });
    if (!response.ok) console.warn('Portfolio alert delivery failed:', response.status);
    await response.body?.cancel();
  } catch {
    // Notification outages must not turn a successfully saved photo into a failed upload.
    console.warn('Portfolio alert delivery unavailable.');
  } finally {
    clearTimeout(timeout);
  }
}

export const notifyPhotoUpload=id=>sendNotification({
  title:'After Hours: new photo',message:'Someone uploaded a photo to your portfolio. Tap to view it.',tags:['camera'],
  click:`https://vikram-singh.vercel.app/api/photos?id=${encodeURIComponent(id)}`,
});
export const notifyIndiaVisit=state=>sendNotification({
  title:'Portfolio visitor',message:state?`A user from ${state} visited your website.`:'A user from India visited your website (state unavailable).',tags:['india'],
});

export const notifyStickyNote=text=>sendNotification({
  title:'After Hours: new sticky note',message:text,tags:['memo'],
  click:'https://vikram-singh.vercel.app/after-hours',
});

export const notifyChatResponse=({prompt,mode,createdAtIST})=>sendNotification({
  title:'Portfolio: chatbot response',
  message:`${mode==='ai'?'AI response generated':'Résumé fallback response'}\n${createdAtIST}\nQuestion: ${prompt}`,
  tags:['speech_balloon'],
});
