import { model } from "@/lib/gemini";

export async function generateChatResponse(message: string, schedule: any[], backlog: any[], currentTime: string) {
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

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Gemini Response:", text);

        let cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }

        const data = JSON.parse(cleanJson);
        return data;
    } catch (error: any) {
        console.error("Gemini Error:", error);
        throw new Error(error.message);
    }
}

export async function generateAutoSchedule(schedule: any[], backlog: any[], currentTime: string) {
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

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }

        const data = JSON.parse(cleanJson);
        return data;
    } catch (error: any) {
        console.error("Auto Schedule Error:", error);
        throw new Error(error.message);
    }
}
