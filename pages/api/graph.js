import connectDB from "../../database/connector";

export default async function handler(req, res) {
  try {
    const db = await connectDB();
    
    // Fetch all documents from userIPs collection
    const userIPs = await db.collection("userIPs").find({}).toArray();
    
    // Aggregate visits by date (using lastVisit date)
    const visitsByDate = {};
    
    userIPs.forEach((doc) => {
      // Parse the lastVisit date string (format: "30/11/2025, 10:29:11 am")
      const dateStr = doc.lastVisit;
      if (!dateStr) return;
      
      // Extract date part (before the comma)
      const datePart = dateStr.split(",")[0].trim();
      const [day, month, year] = datePart.split("/");
      
      // Convert to YYYY-MM-DD format
      const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      
      // Sum visits for this date
      // Handle both regular numbers and MongoDB extended JSON format
      const visitsCount = typeof doc.visits === "object" && doc.visits?.$numberInt
        ? parseInt(doc.visits.$numberInt, 10)
        : parseInt(doc.visits, 10) || 0;
      
      if (!visitsByDate[formattedDate]) {
        visitsByDate[formattedDate] = 0;
      }
      visitsByDate[formattedDate] += visitsCount;
    });
    
    // Convert to array format expected by chart
    const chartData = Object.entries(visitsByDate)
      .map(([date, visits]) => ({
        date,
        visits: parseInt(visits, 10) || 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return res.status(200).json(chartData);
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return res.status(500).json({ error: "Failed to fetch graph data" });
  }
}