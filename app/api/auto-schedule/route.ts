import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { schedule, backlog, currentTime } = await req.json();

        const prompt = `
      You are an expert time-blocking optimization scheduling AI.
      Current Time: ${currentTime}
      
      Goal: Automatically schedule ALL backlog tasks into the empty slots in the schedule, starting from the current time onwards.
      
      Rules:
      1. Respect existing scheduled tasks (do not overlap unless unavoidable/asked - assume NO overlap).
      2. Fit backlog tasks into gaps.
      3. If a task is too long for a gap, you can split it or move it to a later large gap (but preferred not to split).
      4. Try to group similar tasks if context (title) suggests it.
      5. Return the NEW schedule (combined old + newly scheduled) and the remaining backlog (should be empty ideally).
      
      Current Schedule:
      ${JSON.stringify(schedule)}
      
      Backlog:
      ${JSON.stringify(backlog)}
      
      Return ONLY valid JSON:
      {
        "schedule": [ ...all tasks with start_time set... ],
        "backlog": [ ...any remaining unschedulable tasks... ]
      }
      
      Time Format: "HH:mm" (24h)
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup JSON
        let cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }

        const data = JSON.parse(cleanJson);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Auto Schedule Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
