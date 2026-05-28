export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "POST以外は使えません"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "VercelのEnvironment VariablesにGEMINI_API_KEYが設定されていません"
      });
    }

    const goal = req.body?.goal || "";

    if (!goal) {
      return res.status(400).json({
        error: "goalが送られていません"
      });
    }

    const geminiRes = await fetch(
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
                  text: `あなたはフィットネスコーチです。次の目標に対して、初心者にもわかる日本語で3〜4行の具体的なプランを作ってください。\n\n目標: ${goal}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({
        error: data.error?.message || "Gemini APIエラー",
        raw: data
      });
    }

    const plan =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!plan) {
      return res.status(500).json({
        error: "Geminiからplanが返りませんでした",
        raw: data
      });
    }

    return res.status(200).json({
      plan
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message
    });
  }
}
