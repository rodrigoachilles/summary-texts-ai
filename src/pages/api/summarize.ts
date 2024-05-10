import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { NextApiRequest, NextApiResponse } from "next";

interface SummarizeRequestBody {
  text: string;
}

const summarizeHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { text } = req.body as SummarizeRequestBody;
    const summary = await summarizeInGemini(text);
    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error summarizing text:", error);
    res.status(500).json({ error: "Error summarizing text" });
  }
};

export default summarizeHandler;

async function summarizeInGemini(text: string) {
  const MODEL_NAME = "gemini-1.5-pro-latest";
  const API_KEY = process.env.GOOGLE_API_KEY!;
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME }, { apiVersion: 'v1beta' });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const instruction = "Crie um resumo do texto a seguir, com no máximo 1 parágrafo e 10 linhas, descrevendo-o de forma sucinta para que o usuário entenda do que se trata";
  const parts = [{ text: `${instruction}: ${text}` }];

  const result = await model.generateContent({ contents: [{ role: "user", parts }], generationConfig, safetySettings });
  const response = result.response;
  return response.text();
}
