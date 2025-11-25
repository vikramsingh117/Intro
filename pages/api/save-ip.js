import connectDB from "../../database/connector";

export default async function handler(req, res) {
  try {
    const db = await connectDB();

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";
    const response = await fetch(`https://ipwho.is/${ip}`);
    const ipdata= await response.json();
    if (ipdata.success) {
      const location = ipdata.region || 'Unknown';
      const postalCode = ipdata.postal || 'Unknown';
      const latitude = ipdata.latitude || null;
      const longitude = ipdata.longitude || null;
      const city = ipdata.city || 'Unknown';
        
    }
    const indiantime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    // console.log(location, postalCode, latitude, longitude, city);


    const result = await db.collection("userIPs").findOneAndUpdate(
      { ip }, // find existing
      {
        $setOnInsert: { ip, firstVisit: new Date(indiantime), location, postalCode, latitude, longitude, city },
        $set: { lastVisit: new Date(indiantime) },
        $inc: { visits: 1 },

      },
      {
        upsert: true,
        returnDocument: "after" // returns updated doc
      }
    );

    res.status(200).json({
      success: true,
      ip,
      visits: result.value.visits
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
