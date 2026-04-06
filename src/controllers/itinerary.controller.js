// itinerary.controller.js
export const generateItinerary = async (req, res) => {
  try {
    const { days, budget, travelers, interests } = req.body;

    if (!days || !budget || !travelers || !interests?.length) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const prompt = `Act as a world-class luxury travel concierge.
Create a highly detailed ${days}-day Dubai itinerary for ${travelers}.
Budget: ${budget}
Interests: ${interests.join(", ")}

Format the output EXACTLY in clean markdown:

### ${days}-Day ${budget} Trip in Dubai
*(Brief intro paragraph)*

**Day 1: [Catchy Title]**
*The Theme: [Theme]*
- **Breakfast:** [Place + description]
- **Morning Activity:** [Details]
- **Lunch:** [Place + description]
- **Afternoon Activity:** [Details]
- **Dinner:** [Place + description]
- **Fun Tip:** [One tip]

Repeat for all ${days} days. Make places realistic and premium.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // fastest + cheapest
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Claude API Error:", data);
      throw new Error(data.error?.message || "Claude API failed");
    }

    const responseText = data.content[0].text;

    return res.status(200).json({
      success: true,
      itinerary: responseText,
    });

  } catch (error) {
    console.error("🔴 Server Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate itinerary. Please try again.",
    });
  }
};