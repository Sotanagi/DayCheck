export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { goal } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `フィットネス目標「${goal}」を達成するための具体的なアドバイスを3〜4行で提案してください。`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const plan =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "プランを作成できませんでした。";

    res.status(200).json({ plan });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
