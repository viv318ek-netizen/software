import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedResponse } from "../types";

const apiKey = process.env.API_KEY || "";

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    html: {
      type: Type.STRING,
      description: "The complete, valid HTML5 code for the requested website, including all Tailwind CSS classes and necessary CDN links.",
    },
    message: {
      type: Type.STRING,
      description: "A short, friendly message explaining what was built or changed.",
    },
  },
  required: ["html", "message"],
};

const SYSTEM_INSTRUCTION = `
You are Gemini Web Architect, an expert frontend engineer and UI/UX designer.
Your goal is to generate single-file HTML websites based on user prompts.

RULES:
1. Always use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
2. Use modern, beautiful, and responsive designs.
3. If the user asks for images, use 'https://picsum.photos/seed/{seed}/800/600' or similar placeholders.
4. If the user asks for icons in the website, use the FontAwesome CDN: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">.
5. Provide the FULL HTML file every time. Do not provide partial snippets.
6. The HTML must be self-contained and run immediately in an iframe.
7. Ensure good contrast and accessibility.
`;

let chatSession: any = null;

export const startChatSession = () => {
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7, // Slightly creative but structured
    },
  });
};

export const sendMessage = async (message: string): Promise<GeneratedResponse> => {
  if (!chatSession) {
    startChatSession();
  }

  try {
    const result = await chatSession.sendMessage({ message });
    const responseText = result.text;
    
    if (!responseText) {
      throw new Error("No response from Gemini");
    }

    // Parse the JSON response
    const parsed: GeneratedResponse = JSON.parse(responseText);
    return parsed;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const resetSession = () => {
  chatSession = null;
  startChatSession();
};
