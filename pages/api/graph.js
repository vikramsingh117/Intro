import connectDB from "../../database/connector";

export default async function handler(req, res) {
  try {
    const db = await connectDB();
    
    // Fetch all documents from userIPs collection
    const userIPs = await db.collection("userIPs").find({}).toArray();

    // If client requests city-wise breakdown for a specific date
    const { breakdown, date: queryDate } = req.query || {};

    if (breakdown === "city" && queryDate) {
      // Helper function to check if a city/location is from India
      const isFromIndia = (city, location) => {
        if (!city || !location) return false;
        
        const cityLower = city.toLowerCase();
        const locationLower = location.toLowerCase();
        
        // List of major Indian cities
        const indianCities = [
          'mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata',
          'pune', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur', 'nagpur', 'indore',
          'thane', 'bhopal', 'visakhapatnam', 'patna', 'vadodara', 'ghaziabad', 'ludhiana',
          'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'varanasi', 'srinagar',
          'amritsar', 'raipur', 'allahabad', 'howrah', 'coimbatore', 'jabalpur', 'gwalior',
          'vijayawada', 'madurai', 'guwahati', 'chandigarh', 'hubli', 'mysore', 'kochi',
          'kozhikode', 'trivandrum', 'bhubaneswar', 'dehradun', 'mangalore', 'belgaum',
          'tiruchirappalli', 'salem', 'tirunelveli', 'warangal', 'guntur', 'kurnool'
        ];
        
        // List of Indian states
        const indianStates = [
          'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
          'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
          'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
          'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana',
          'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal', 'delhi', 'jammu and kashmir',
          'ladakh', 'puducherry', 'chandigarh', 'daman and diu', 'dadra and nagar haveli',
          'lakshadweep', 'andaman and nicobar islands'
        ];
        
        return indianCities.includes(cityLower) || indianStates.some(state => 
          locationLower.includes(state) || cityLower.includes(state)
        );
      };

      const visitsByCity = {};

      userIPs.forEach((doc) => {
        const dateStr = doc.lastVisit;
        if (!dateStr) return;

        // Extract date part and normalize to YYYY-MM-DD
        const datePart = dateStr.split(",")[0].trim(); // "30/11/2025"
        const [day, month, year] = datePart.split("/");
        const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        if (formattedDate !== queryDate) return;

        // Handle both regular numbers and MongoDB extended JSON format
        const visitsCount =
          typeof doc.visits === "object" && doc.visits?.$numberInt
            ? parseInt(doc.visits.$numberInt, 10)
            : parseInt(doc.visits, 10) || 0;

        const city = doc.city || "Unknown";
        const location = doc.location || "";
        const isIndia = isFromIndia(city, location);

        // Use "bots" as key for non-Indian cities, otherwise use city name
        const key = isIndia ? city : "bots";

        if (!visitsByCity[key]) {
          visitsByCity[key] = { visits: 0, isBot: !isIndia };
        }
        visitsByCity[key].visits += visitsCount;
      });

      const cityData = Object.entries(visitsByCity).map(([city, data]) => ({
        city,
        visits: parseInt(data.visits, 10) || 0,
        isBot: data.isBot,
      }));

      return res.status(200).json(cityData);
    }
    
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