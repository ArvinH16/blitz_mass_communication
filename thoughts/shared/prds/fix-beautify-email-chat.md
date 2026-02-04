# PRD: Fix Beautify Email AI Chat

## Problem Description
The "Beautify Email" feature includes an AI chat interface intended to allow users to redesign the email through conversation (e.g., "Make the header blue", "Remove the footer"). Currently, this feature is non-functional:
1.  **No Visual Updates**: When the user sends a message, the email design (HTML) often does not update.
2.  **No Context**: The AI does not remember previous turns in the conversation, making iterative design impossible.
3.  **Fragile Parsing**: The backend often fails to parse the AI's response if it includes Markdown formatting (e.g., code blocks), resulting in no changes being applied.

## Root Cause Analysis
1.  **Shared/Legacy API**: The feature currently uses a generic `/api/ai-assist` endpoint which is designed for simple, single-turn text improvement, not complex conversational state management or structural HTML updates.
2.  **Statelessness**: The current API call does not send the conversation history, so the AI treats every request as a brand new context.
3.  **JSON Parsing Failure**: The API expects strict JSON but GPT models often wrap JSON in Markdown code blocks (```json ... ```), causing `JSON.parse` to fail. When it fails, it returns a text message without the `updatedHtml` payload.
4.  **Implicit Prompt**: The prompt instruction for JSON output is not strict enough.

## Proposed Solution
We will implement a dedicated "Conversation API" for the email designer that maintains context and robustly handles structured outputs. This aligns with "Phase 1" of the previously proposed AI Email Design Assistant plan.

### 1. Dedicated Backend Endpoint
Create `src/app/api/email-conversation/route.ts` that:
-   Accepts the full `conversationHistory` from the client.
-   Accepts the `currentHtml` and `originalContent`.
-   Uses a strict System Prompt enforcing JSON output and defining the AI's role as a design assistant.
-   Implements robust response cleaner to strip Markdown code blocks before `JSON.parse`.
-   Returns `updatedHtml`, `suggestions`, and a conversational `message`.

### 2. Frontend Integration
Update `src/components/ui/EmailBeautifyDialog.tsx` to:
-   Maintain the conversation state (`chatMessages`) locally.
-   Call the new `/api/email-conversation` endpoint instead of `/api/ai-assist`.
-   Pass the full `chatMessages` array in the API payload.
-   Correctly handle the structured response to update:
    -   `htmlContent` (the email design).
    -   `chatMessages` (adding the AI's text response).
    -   `aiEnhancements` (if metadata was updated).

## Technical Specifications

### API Route: `/api/email-conversation`
**Method**: POST

**Request Body**:
```typescript
interface ConversationRequest {
  message: string;
  conversationHistory: { role: 'user' | 'assistant', content: string }[];
  currentHtml: string;
  originalContent: {
    subject: string;
    message: string;
    orgName: string;
  };
  isInitialGreeting?: boolean;
}
```

**Response Body**:
```typescript
interface ConversationResponse {
  success: true;
  message: string; // The text reply
  updatedHtml: string | null; // The new HTML if changed
  suggestions: string[]; // 3 quick follow-up suggestions
  changesSummary: string | null; // Brief technical summary of changes
}
```

### System Prompt Strategy
The system prompt must explicitly handle:
-   **Role**: Expert HTML email designer.
-   **Output**: STRICT JSON format.
-   **Conversation**: Remembering previous context (handled by injecting history).
-   **Proactivity**: Suggesting improvements if the user's request is vague.

## Implementation Plan
1.  **Create API Route**: Implement `src/app/api/email-conversation/route.ts` with Open AI integration and robust JSON parsing.
2.  **Refactor Frontend**: Modify `EmailBeautifyDialog.tsx` to switch to this new API and send history.
3.  **Testing**: Verify "Make it blue" updates the color, and follow-up "Make it darker" understands "it" refers to the previous context.

## Success Criteria
-   [ ] User can ask "Change the background to blue" and the preview updates immediately.
-   [ ] User can follow up with "Actually, make it darker" and the AI understands the context.
-   [ ] No console errors regarding JSON parsing.
