import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper to strip markdown code blocks from JSON response
function cleanJsonResponse(response: string): string {
    // Remove ```json and ``` or just ``` markers
    let cleaned = response.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    return cleaned.trim();
}

export async function POST(request: NextRequest) {
    try {
        // Get access code from cookie - security check
        const accessCode = request.cookies.get('access-code');

        if (!accessCode) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { message, conversationHistory, currentHtml, originalContent, isInitialGreeting } = body;

        if (!message && !conversationHistory) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Construct the messages array for the AI
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `You are an expert HTML email designer and frontend developer. 
Your goal is to help users customize their email designs through conversation.

CONTEXT:
You have access to the current HTML of the email.
You will receive a conversation history to understand the context of changes (e.g., "Make it blue" after discussing the header means "Make the header blue").

INSTRUCTIONS:
1. Parse the user's request in the context of the conversation history.
2. If the user asks for a visual change (color, layout, font, spacing, adding/removing elements), YOU MUST update the HTML code.
3. If the user asks for content changes, update the text within the HTML.
4. Ensure all HTML is valid, inline-styled (for email compatibility), and responsive.
5. If the request is vague, ask for clarification but also offer a best-guess change if possible.
6. Provide 3 short, relevant follow-up suggestions for the user.

OUTPUT FORMAT:
You MUST respond with a valid JSON object. Do not include any markdown formatting or explanation outside the JSON.
{
  "message": "A conversational response explaining what you did or asking for clarification.",
  "updatedHtml": "The complete, modified HTML string. Return null if no changes were made to the HTML.",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "changesSummary": "A brief technical summary of changes (e.g., 'Changed header background to #0000FF') or null."
}`
            }
        ];

        // Add conversation history
        if (conversationHistory && Array.isArray(conversationHistory)) {
            // Filter out any messages that might be invalid
            const validHistory = conversationHistory.filter(msg => msg.role === 'user' || msg.role === 'assistant');

            // Exclude the last message if it matches the current 'message' payload to avoid duplication
            // (Since the frontend optimistically adds it to history)
            const lastMsg = validHistory[validHistory.length - 1];
            const historyToUse = (lastMsg && lastMsg.role === 'user' && lastMsg.content === message)
                ? validHistory.slice(0, -1)
                : validHistory;

            historyToUse.forEach(msg => {
                messages.push({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content
                });
            });
        }

        // Add the current context and latest user message
        const userPrompt = `
CURRENT EMAIL HTML:
${currentHtml || 'No HTML provided yet.'}

ORIGINAL CONTENT METADATA:
Subject: ${originalContent?.subject || 'N/A'}
Org Name: ${originalContent?.orgName || 'N/A'}
Original Text: ${originalContent?.message || 'N/A'}

USER REQUEST:
${message}
`;

        messages.push({
            role: "user",
            content: userPrompt
        });

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Using mini for speed/cost, can upgrade to gpt-4o if complex logic fails
            messages: messages,
            temperature: 0.7,
            response_format: { type: "json_object" }, // Enforce JSON mode
            max_tokens: 4000, // Allow enough tokens for full HTML return
        });

        const aiResponseContent = completion.choices[0]?.message?.content;

        if (!aiResponseContent) {
            throw new Error("No response from AI");
        }

        let parsedResponse;
        try {
            const cleanedContent = cleanJsonResponse(aiResponseContent);
            parsedResponse = JSON.parse(cleanedContent);
        } catch (e) {
            console.error("JSON parse error:", e);
            console.error("Raw content:", aiResponseContent);
            // Fallback
            return NextResponse.json({
                success: true,
                message: "I made some changes, but there was an error processing the robust output. Please try again.",
                updatedHtml: null,
                suggestions: [],
                changesSummary: null
            });
        }

        return NextResponse.json({
            success: true,
            ...parsedResponse
        });

    } catch (error) {
        console.error('Error in email conversation:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to process request' },
            { status: 500 }
        );
    }
}
