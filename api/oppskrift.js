eexport default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://www.ungkarskokken.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Preflight request
    res.status(200).end();
    return;
  }

  try {
    const { ingredients } = req.body;

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
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    const data = await response.json();

    res.status(200).json(data.choices[0].message);
  } catch (error) {
    console.error("Feil i oppskrifts-API:", error);
    res.status(500).json({ error: "Noe gikk galt på kjøkkenet 😢" });
  }
}