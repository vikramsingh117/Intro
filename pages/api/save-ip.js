import connectDB from "../../database/connector";

export default async function handler(req, res) {
  try {
    const db = await connectDB();

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    // Default values
    let location = "Unknown";
    let postalCode = "Unknown";
    let latitude = null;
    let longitude = null;
    let city = "Unknown";

    if (ip !== "unknown") {
      const response = await fetch(`https://ipwho.is/${ip}`);
      const ipdata = await response.json();

      if (ipdata.success) {
        location = ipdata.region || "Unknown";
        postalCode = ipdata.postal || "Unknown";
        latitude = ipdata.latitude ?? null;
        longitude = ipdata.longitude ?? null;
        city = ipdata.city || "Unknown";
      }
    }

    // Better: store UTC timestamp, not localized string
    const now = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const result = await db.collection("userIPs").findOneAndUpdate(
      { ip },
      {
        $setOnInsert: {
          ip,
          firstVisit: now,
          location,
          postalCode,
          latitude,
          longitude,
          city,
        },
        $set: { lastVisit: now },
        $inc: { visits: 1 },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );
     // THIS WAS MISSING
    return res.status(200).json({
      success: true,
      ip,
      location,
      postalCode,
      latitude,
      longitude,
      city,
      visits: result.value?.visits || 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
