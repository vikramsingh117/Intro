import connectDB from "../../database/connector";

export default async function handler(req, res) {
  try {
    const db = await connectDB();

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    const result = await db.collection("userIPs").findOneAndUpdate(
      { ip }, // find existing
      {
        $set: { updatedAt: new Date() },          // always update
        $inc: { visits: 1 },                      // increment counter
        $setOnInsert: { createdAt: new Date() }   // only on first insert
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
