import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, schedule, backlog, currentTime } = await req.json();

    const prompt = `
      You are a smart time-blocking assistant for a user in Jakarta.
      Current Time: ${currentTime}
      
      Current Schedule (Scheduled Tasks):
      ${JSON.stringify(schedule)}
      
      Backlog (Unscheduled Tasks):
      ${JSON.stringify(backlog)}
      
      User Message: "${message}"
      
      Goal: Update the schedule and backlog based on the user's input.
      - If they said they procrastinated, shift future tasks.
      - If they want to add a task, add it.
      - Optimization is key.
      
      Return valid JSON with two arrays:
      {
        "schedule": [ ...updated scheduled tasks... ],
        "backlog": [ ...updated backlog tasks... ],
        "reply": "A short, fun, cartoonish persona response to the user."
      }
      
      Ensure task objects keep their existing IDs.
      If you create NEW tasks, generate a valid UUID for the "id" field (e.g., "550e8400-e29b-41d4-a716-446655440000").
      IMPORTANT: Format "start_time" as "HH:mm" (24h format, e.g., "14:00") for scheduled tasks. Backlog tasks have start_time: null.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini Response:", text);

    // Robust JSON cleanup
    let cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // Sometimes Gemini returns text before the JSON object, find the first '{' and last '}'
    const firstBrace = cleanJson.indexOf('{');
    const lastBrace = cleanJson.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
