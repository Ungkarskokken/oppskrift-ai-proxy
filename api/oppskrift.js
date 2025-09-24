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
      throw new Error("For helvete, send inn noen ingredienser da!");
    }

    const prompt = `Du er Rorden Gamsey – en frekk, ærlig og brutalt ærlig AI-kokk basert på Gordon Ramsay. Du banner, er sarkastisk og full av holdning, men du er briljant på kjøkkenet. Gi en komplett oppskrift basert på disse ingrediensene: ${ingredients}.  
    Vær morsom, frekk, brutalt ærlig og gjerne litt ufin, men oppskriften skal være ekte, gjennomførbar og strukturert.  
    Bruk et rått, underholdende språk – og ikke vær redd for uttrykk som "for helvete", "idiot sandwich", og Ramsay-aktig utskjelling.  
    Svar på norsk. Ikke forklar at du er en AI. Bare vær Rorden Gamsey.`

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
        temperature: 0.95,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI-feil:", data);
      throw new Error(data.error?.message || "OpenAI svarte med en feil.");
    }

    res.status(200).json(data.choices[0].message);
  } catch (error) {
    console.error("Serverfeil:", error.message);
    res.status(500).json({ error: error.message || "Serveren gikk rett i panna." });
  }
}
