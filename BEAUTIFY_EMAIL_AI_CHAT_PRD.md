# Beautify Email AI Chat PRD

## Overview
The **Beautify Email AI Chat** feature enhances the existing email beautification tool by adding an interactive chat interface. This allows users to converse with an AI agent to iteratively refine and customize their email designs, rather than relying solely on static templates or one-off generation.

## Goals
1.  **Iterative Customization**: Enable users to request specific changes (e.g., "make the header blue", "add a button", "make the tone more formal") and see real-time updates.
2.  **Context Awareness**: The AI should understand the current state of the email (subject, content, template) to provide relevant modifications.
3.  **User Guidance**: Provide suggestions and simplified interaction for users who may not know technical design terms.

## User Stories
-   **As a user**, I want to open a chat window within the Email Beautify dialog so I can ask for changes.
-   **As a user**, I want to see my changes reflected immediately in the email preview after the AI processes my request.
-   **As a user**, I want the AI to understand the context of my email (e.g., if I'm sending a formal invitation vs. a casual newsletter).
-   **As a user**, I want to be able to undo changes or revert to a previous state (implicitly supported via chat history or "undo" requests).

## Functional Requirements

### 1. UI Components
-   **Chat Toggle**: A button to open/close the AI chat interface within the `EmailBeautifyDialog`.
-   **Chat Interface**:
    -   Message history view (user and assistant messages).
    -   Input field for typing requests.
    -   Send button.
    -   Loading state indicators ("Thinking...").
-   **Suggestions**: Display example prompts (e.g., "Change colors", "Make it shorter") when the chat is empty.

### 2. AI Integration
-   **Endpoint**: `/api/ai-assist`
-   **Request Payload**:
    -   `message`: User's prompt.
    -   `context`: Current HTML content, subject, template, and organization name.
    -   `type`: `email_customization`
-   **Response Format**: JSON object containing:
    -   `response`: Textual explanation of changes.
    -   `updatedHtml`: (Optional) The modified full HTML string.
    -   `updatedEnhancements`: (Optional) Updated metadata like subject line or preview text.

### 3. Backend Logic (Prompt Engineering)
-   The system prompt must instruct the AI to act as an email designer and HTML specialist.
-   The AI must return a specific JSON structure to allow the frontend to update the preview programmatically.
-   The AI should be able to handle both content changes (text) and design changes (CSS/HTML structure).

## Technical Implementation Details

### Frontend (`EmailBeautifyDialog.tsx`)
-   **State Management**:
    -   `showAIChat`: boolean
    -   `chatMessages`: Array of message objects
    -   `currentMessage`: string
-   **Effect**: Focus functionality for chat input.
-   **API Call**: `fetch('/api/ai-assist', ...)` with `email_customization` type.
-   **Rendering**: Conditionally render `AIChatInterface` component.

### Backend (`route.ts`)
-   Handle `type === 'email_customization'`.
-   Construct a detailed prompt including the `currentHtml` to ensure the AI modifies existing code rather than hallucinating from scratch.
-   Enforce JSON mode or structure in the AI response.

## Success Metrics
-   User engagement with the chat feature (number of messages sent).
-   Successful parsing of AI responses (low error rate).
-   User satisfaction (qualitative, based on feedback or lack of "undo" actions).
