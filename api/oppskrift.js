export default async function handler(req, res) {
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
}
