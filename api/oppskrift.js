export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.ungkarskokken.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const ingredients = req.body.ingredients;

    if (!ingredients) {
      throw new Error("Ingen ingredienser mottatt.");
    }

    const prompt = `Lag en oppskrift basert på disse ingrediensene: ${ingredients}. Skriv som en norsk matblogger, med litt sjarm og humor.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    res.status(200).json(data.choices[0].message);
  } catch (error) {
    console.error("Feil:", error.message);
    res.status(500).json({ error: "Intern serverfeil 😢" });
  }
}
