import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ConflictSession, UserProfile } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");
  return new GoogleGenAI({ apiKey });
};

export const analyzeConflict = async (
  session: ConflictSession,
  userA: UserProfile,
  userB: UserProfile
): Promise<AnalysisResult> => {
  const ai = createClient();

  const systemInstruction = `
    You are "The Pov", a Relationship Conflict Engine based on Cognitive Behavioral Therapy (CBT).
    Your goal is to be brutally honest, identifying cognitive distortions, validating fair points, and pointing out uncomfortable truths for both partners.
    
    You do not sugarcoat. You are neutral but firm.
    You must identify if abuse is present.
    
    You will be given the profiles of two partners (A and B) including their traumas, triggers, and core beliefs.
    You will be given the conflict reports from both sides.
    
    Your Output must be JSON adhering to the specific schema provided.
    
    Analyze:
    1. Cognitive Distortions (Mind reading, Catastrophizing, Labelling, etc.)
    2. How their Core Beliefs/Traumas triggered the reaction.
    3. The "Hard Truth" - the blunt reality they need to hear about their behavior.
    4. Fair Points - what they actually got right.
    5. Constructive Resolution.
  `;

  const prompt = `
    PARTNER A PROFILE:
    Name: ${userA.displayName}
    Triggers: ${userA.triggers.join(', ')}
    Core Beliefs: ${userA.coreBeliefs.join(', ')}
    Conflict Style: ${userA.conflictStyle}
    Attachment: ${userA.attachmentStyle}

    PARTNER B PROFILE:
    Name: ${userB.displayName}
    Triggers: ${userB.triggers.join(', ')}
    Core Beliefs: ${userB.coreBeliefs.join(', ')}
    Conflict Style: ${userB.conflictStyle}
    Attachment: ${userB.attachmentStyle}

    CONFLICT REPORT PARTNER A:
    Happened: "${session.reportA.whatHappened}"
    Reaction: "${session.reportA.reaction}"
    Feeling: "${session.reportA.feelings}"
    Triggered By: "${session.reportA.trigger}"

    CONFLICT REPORT PARTNER B:
    Happened: "${session.reportB?.whatHappened}"
    Reaction: "${session.reportB?.reaction}"
    Feeling: "${session.reportB?.feelings}"
    Triggered By: "${session.reportB?.trigger}"

    AMENDMENTS BY PARTNER A (After reading B's side):
    "${session.amendmentA || 'None'}"

    Generate the CBT Analysis.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          partnerA_analysis: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              distortions: { type: Type.ARRAY, items: { type: Type.STRING } },
              hardTruth: { type: Type.STRING },
              fairPoints: { type: Type.STRING },
            },
            required: ['summary', 'distortions', 'hardTruth', 'fairPoints']
          },
          partnerB_analysis: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              distortions: { type: Type.ARRAY, items: { type: Type.STRING } },
              hardTruth: { type: Type.STRING },
              fairPoints: { type: Type.STRING },
            },
            required: ['summary', 'distortions', 'hardTruth', 'fairPoints']
          },
          resolution: {
            type: Type.OBJECT,
            properties: {
              immediateSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              longTermWork: { type: Type.STRING },
              safetyWarning: { type: Type.STRING }
            },
            required: ['immediateSteps', 'longTermWork']
          }
        },
        required: ['partnerA_analysis', 'partnerB_analysis', 'resolution']
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate analysis");
  }

  return JSON.parse(response.text) as AnalysisResult;
};
