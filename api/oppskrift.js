export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.ungkarskokken.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const ingredients = (req.body?.ingredients || "").toString().trim();
    const mode = (req.body?.mode || "normal").toString().trim(); // normal | cheap | friday

    if (!ingredients) {
      // Snill, men tydelig
      throw new Error("Skriv inn et par ingredienser først 🙂 (f.eks. “egg, ost, skinke”).");
    }

    const modeHint =
      mode === "cheap"
        ? "Modus: BILLIG. Prioriter rimelige råvarer og enkle grep. Unngå dyre forslag."
        : mode === "friday"
        ? "Modus: FREDAGSMODUS. Maks 15–20 minutter, få steg, lite oppvask, null fjas."
        : "Modus: NORMAL. Raskt, gjennomførbart og godt.";

    // Ungkarskokken-personlighet og faste rammer
    const system = `
Du er "Ungkarskokken" – en norsk, hjelpsom og litt frekk (på den hyggelige måten) kokkestemme.
Du er jordnær, praktisk og morsom, men ALDRI ufin: ingen banning, ingen utskjelling, ingen nedsettende språk.
Skriv for vanlige folk med dårlig tid. Ingredienser skal være lette å finne i Norge.
Gi konkrete mengder, temperatur, tider og enkle steg. Ingen kokkeskole-snakk.
Hvis brukerens ingrediensliste er rar, mangler ting eller virker umulig: foreslå 1–3 billige “handle-tillegg” og forklar hvorfor.
Ikke forklar at du er en AI.
`;

    const user = `
${modeHint}

Ingredienser brukeren har:
${ingredients}

Lag en oppskrift på norsk i denne strukturen (bruk overskrifter nøyaktig slik):

Tittel:
Kort intro (1–3 setninger, litt humor):
Du trenger:
Slik gjør du:
Tips og bytter:
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        // Hvis du vil holde deg til det du har: behold "gpt-4".
        // Men om du kan: bruk en nyere modell du har tilgang til i kontoen din.
        model: "gpt-4",
        messages: [
          { role: "system", content: system.trim() },
          { role: "user", content: user.trim() },
        ],
        max_tokens: 900,
        temperature: 0.8,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI-feil:", data);
      throw new Error(data.error?.message || "OpenAI svarte med en feil.");
    }

    // Returner bare innholdet i samme format som før (data.choices[0].message.content)
    res.status(200).json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error("Serverfeil:", error.message);
    res.status(500).json({ error: error.message || "Serveren tok en liten timeout. Prøv igjen." });
  }
}

