# AI Email Design Assistant - Implementation Plan

## Overview

Transform the current "Beautify Email" feature into a full-fledged AI Design Assistant that enables users to have natural, human-like conversations to design their email templates. The AI will proactively suggest improvements, offer design alternatives, and allow users to iteratively refine their email through conversational interaction.

## Current State Analysis

### Existing Implementation

**EmailBeautifyDialog** (`src/components/ui/EmailBeautifyDialog.tsx`)
- Basic dialog with template selection (Professional, Modern, Marketing, Newsletter)
- Simple AI chat interface with single-turn interactions
- Desktop/mobile preview toggle
- HTML source code view

**AI Assist API** (`src/app/api/ai-assist/route.ts`)
- Handles `email_customization` type requests
- Takes current HTML + user message → returns updated HTML
- Uses GPT-4o-mini with 2000 max tokens
- No conversation memory beyond current request

**Email Beautify API** (`src/app/api/email-beautify/route.ts`)
- Generates initial HTML email from plain text
- 4 predefined templates with color schemes
- AI-enhanced subject lines, subtitles, and content formatting

### Current Limitations
- No proactive suggestions from the AI
- Limited conversation context (each message is independent)
- No design preferences input from users
- Users must know what to ask for
- No visual element selection for targeted changes
- Single-pass generation without iterative refinement

## Desired End State

### User Experience Flow

1. **User clicks "Beautify Email"** → Dialog opens with initial AI-generated email
2. **AI immediately greets and offers suggestions** → "I've created your email! Here are some ways I can improve it: [suggestions]"
3. **User can set preferences** → Design preferences panel for style direction
4. **Natural conversation** → Multi-turn dialogue with full context memory
5. **AI proactively helps** → Suggests improvements, asks clarifying questions, offers alternatives
6. **Real-time preview updates** → Every AI change instantly reflected in preview
7. **Final confirmation** → User approves and uses the designed email

### Key Features

1. **Proactive AI Design Assistant**
   - Greets user with initial suggestions after generating email
   - Offers 3-4 specific improvement ideas based on content analysis
   - Asks clarifying questions about user intent
   - Suggests alternatives when making changes

2. **Design Preferences Panel**
   - Style mood selector (Professional, Playful, Bold, Minimal, Elegant)
   - Color preference input (brand colors or mood-based)
   - Tone selector (Formal, Friendly, Urgent, Inspirational)
   - Content density preference (Compact, Balanced, Spacious)

3. **Conversation Memory**
   - Full context of design session maintained
   - AI remembers user preferences expressed in conversation
   - Can reference and undo previous changes
   - Builds on prior decisions

4. **Rich Interaction Capabilities**
   - Add/remove sections (headers, CTAs, dividers, images placeholders)
   - Complete layout restructuring
   - Color scheme changes
   - Typography adjustments
   - Content rewriting and enhancement
   - Responsive design adjustments

### Success Verification

- [ ] User can have a 5+ turn conversation with the AI
- [ ] AI proactively suggests at least 3 improvements on initial load
- [ ] Design preferences panel affects AI suggestions and output
- [ ] All HTML changes are reflected in real-time preview
- [ ] Conversation context is maintained throughout the session
- [ ] AI can completely redesign the email layout when requested

## What We're NOT Doing

- Image upload/embedding (placeholder support only)
- Saving design templates for reuse (future feature)
- Collaborative editing with multiple users
- Email A/B testing integration
- Analytics integration
- Custom font uploads

## Implementation Approach

Use a phased approach that builds incrementally:
1. First, enhance the AI backend to support conversations and proactive suggestions
2. Then, add the design preferences panel UI
3. Finally, integrate everything with improved UX

---

## Phase 1: Enhanced AI Conversation Backend

### Overview
Build a conversation-aware AI backend that maintains context and can proactively suggest improvements.

### Changes Required

#### 1. Create New Conversation API Route

**File**: `src/app/api/email-conversation/route.ts`

Create a new dedicated API endpoint for the conversational email design assistant.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60; // Allow longer conversations

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DesignPreferences {
  styleMood: 'professional' | 'playful' | 'bold' | 'minimal' | 'elegant';
  tone: 'formal' | 'friendly' | 'urgent' | 'inspirational';
  density: 'compact' | 'balanced' | 'spacious';
  primaryColor?: string;
  secondaryColor?: string;
}

interface ConversationRequest {
  message: string;
  conversationHistory: ConversationMessage[];
  currentHtml: string;
  originalContent: {
    subject: string;
    message: string;
    orgName: string;
  };
  preferences?: DesignPreferences;
  isInitialGreeting?: boolean;
}

const SYSTEM_PROMPT = `You are an expert email design assistant with a friendly, helpful personality. You help users create beautiful, professional HTML emails through natural conversation.

YOUR CAPABILITIES:
- Completely redesign email layouts and structures
- Change colors, fonts, spacing, and typography
- Add or remove sections (headers, CTAs, dividers, quotes, lists)
- Rewrite and enhance content while maintaining the core message
- Create responsive designs that work on mobile and desktop
- Suggest improvements proactively

INTERACTION STYLE:
- Be conversational and friendly, like a helpful design partner
- When making changes, briefly explain what you did and why
- Offer 2-3 follow-up suggestions after each change
- Ask clarifying questions when requests are ambiguous
- Be enthusiastic about good ideas and gently suggest alternatives for problematic ones

RESPONSE FORMAT:
Always respond with a JSON object:
{
  "message": "Your conversational response to the user",
  "updatedHtml": "Complete updated HTML if changes were made (or null if no changes)",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "changesSummary": "Brief list of changes made (or null if no changes)"
}

HTML GUIDELINES:
- Use inline styles for email compatibility
- Include Outlook VML fallbacks for gradients
- Ensure responsive design with media queries
- Use table-based layouts for maximum compatibility
- Preserve {name} placeholders for personalization
- Keep the email structure: header, content, footer

PROACTIVE BEHAVIOR:
- If you notice issues (poor contrast, missing CTA, long paragraphs), mention them
- Suggest improvements even when not asked
- Offer alternatives: "I made it blue, but would you prefer green or purple?"`;

export async function POST(request: NextRequest) {
  try {
    const accessCode = request.cookies.get('access-code');
    if (!accessCode) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body: ConversationRequest = await request.json();
    const {
      message,
      conversationHistory,
      currentHtml,
      originalContent,
      preferences,
      isInitialGreeting
    } = body;

    // Build the conversation messages
    const messages: ConversationMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add preferences context if provided
    if (preferences) {
      messages.push({
        role: 'system',
        content: `USER DESIGN PREFERENCES:
- Style Mood: ${preferences.styleMood}
- Tone: ${preferences.tone}
- Content Density: ${preferences.density}
${preferences.primaryColor ? `- Primary Color: ${preferences.primaryColor}` : ''}
${preferences.secondaryColor ? `- Secondary Color: ${preferences.secondaryColor}` : ''}

Incorporate these preferences into your suggestions and designs.`
      });
    }

    // Add conversation history
    messages.push(...conversationHistory);

    // Build the current user message with context
    let userMessage = '';

    if (isInitialGreeting) {
      userMessage = `The user just opened the email designer. Here's their email:

ORIGINAL SUBJECT: ${originalContent.subject}
ORIGINAL MESSAGE: ${originalContent.message}
ORGANIZATION: ${originalContent.orgName}

CURRENT HTML:
${currentHtml}

Please greet them warmly and provide 3-4 specific suggestions for improving their email. Be specific about what you'd change and why. Make your suggestions actionable and exciting.`;
    } else {
      userMessage = `USER REQUEST: ${message}

CURRENT HTML:
${currentHtml}

ORIGINAL CONTENT (for reference):
- Subject: ${originalContent.subject}
- Message: ${originalContent.message}
- Organization: ${originalContent.orgName}

Please help the user with their request. If making changes, provide the complete updated HTML.`;
    }

    messages.push({ role: 'user', content: userMessage });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.8,
      max_tokens: 4000,
    });

    const aiResponse = completion.choices[0]?.message?.content || '{}';

    // Parse the response
    let parsedResponse;
    try {
      // Clean markdown code blocks if present
      let cleaned = aiResponse.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      parsedResponse = JSON.parse(cleaned);
    } catch {
      // Fallback response
      parsedResponse = {
        message: aiResponse,
        updatedHtml: null,
        suggestions: [],
        changesSummary: null
      };
    }

    return NextResponse.json({
      success: true,
      ...parsedResponse
    });

  } catch (error) {
    console.error('Error in email conversation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process conversation' },
      { status: 500 }
    );
  }
}
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] API route responds to POST requests: Test with curl
- [ ] Linting passes: `npm run lint`

#### Manual Verification:
- [ ] API returns proper JSON response with message, suggestions, and optional HTML
- [ ] Conversation history is properly incorporated into AI context
- [ ] Initial greeting mode provides specific, actionable suggestions

**Implementation Note**: After completing this phase, pause for manual testing of the API endpoint before proceeding.

---

## Phase 2: Design Preferences Panel Component

### Overview
Create a collapsible preferences panel that allows users to set their design direction before and during the conversation.

### Changes Required

#### 1. Create Design Preferences Component

**File**: `src/components/ui/DesignPreferencesPanel.tsx`

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import {
  Palette,
  Type,
  Layout,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export interface DesignPreferences {
  styleMood: 'professional' | 'playful' | 'bold' | 'minimal' | 'elegant';
  tone: 'formal' | 'friendly' | 'urgent' | 'inspirational';
  density: 'compact' | 'balanced' | 'spacious';
  primaryColor: string;
  secondaryColor: string;
}

interface DesignPreferencesPanelProps {
  preferences: DesignPreferences;
  onPreferencesChange: (preferences: DesignPreferences) => void;
  onApplyPreferences: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isLoading?: boolean;
}

const STYLE_MOODS = [
  { id: 'professional', label: 'Professional', emoji: '💼', description: 'Clean and corporate' },
  { id: 'playful', label: 'Playful', emoji: '🎨', description: 'Fun and colorful' },
  { id: 'bold', label: 'Bold', emoji: '⚡', description: 'Strong and impactful' },
  { id: 'minimal', label: 'Minimal', emoji: '✨', description: 'Simple and elegant' },
  { id: 'elegant', label: 'Elegant', emoji: '🌟', description: 'Sophisticated and refined' },
] as const;

const TONES = [
  { id: 'formal', label: 'Formal', description: 'Business-appropriate' },
  { id: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { id: 'urgent', label: 'Urgent', description: 'Action-oriented' },
  { id: 'inspirational', label: 'Inspirational', description: 'Motivating and uplifting' },
] as const;

const DENSITIES = [
  { id: 'compact', label: 'Compact', description: 'More content, less space' },
  { id: 'balanced', label: 'Balanced', description: 'Standard spacing' },
  { id: 'spacious', label: 'Spacious', description: 'Lots of breathing room' },
] as const;

export function DesignPreferencesPanel({
  preferences,
  onPreferencesChange,
  onApplyPreferences,
  isCollapsed,
  onToggleCollapse,
  isLoading = false
}: DesignPreferencesPanelProps) {

  const updatePreference = <K extends keyof DesignPreferences>(
    key: K,
    value: DesignPreferences[K]
  ) => {
    onPreferencesChange({ ...preferences, [key]: value });
  };

  return (
    <Card className="mb-4">
      <CardHeader
        className="cursor-pointer py-3"
        onClick={onToggleCollapse}
      >
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center">
            <Palette className="h-4 w-4 mr-2 text-purple-500" />
            Design Preferences
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </CardTitle>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4 pt-0">
          {/* Style Mood */}
          <div>
            <label className="text-sm font-medium flex items-center mb-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Style Mood
            </label>
            <div className="grid grid-cols-5 gap-1">
              {STYLE_MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => updatePreference('styleMood', mood.id)}
                  className={`p-2 rounded text-center transition-all ${
                    preferences.styleMood === mood.id
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                  title={mood.description}
                >
                  <div className="text-lg">{mood.emoji}</div>
                  <div className="text-xs mt-1">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="text-sm font-medium flex items-center mb-2">
              <Type className="h-3 w-3 mr-1" />
              Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => updatePreference('tone', tone.id)}
                  className={`p-2 rounded text-left transition-all ${
                    preferences.tone === tone.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-sm font-medium">{tone.label}</div>
                  <div className="text-xs text-gray-500">{tone.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div>
            <label className="text-sm font-medium flex items-center mb-2">
              <Layout className="h-3 w-3 mr-1" />
              Content Density
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DENSITIES.map((density) => (
                <button
                  key={density.id}
                  onClick={() => updatePreference('density', density.id)}
                  className={`p-2 rounded text-center transition-all ${
                    preferences.density === density.id
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-sm font-medium">{density.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={preferences.primaryColor || '#3b82f6'}
                  onChange={(e) => updatePreference('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <Input
                  value={preferences.primaryColor || '#3b82f6'}
                  onChange={(e) => updatePreference('primaryColor', e.target.value)}
                  className="flex-1 text-sm"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={preferences.secondaryColor || '#6b7280'}
                  onChange={(e) => updatePreference('secondaryColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <Input
                  value={preferences.secondaryColor || '#6b7280'}
                  onChange={(e) => updatePreference('secondaryColor', e.target.value)}
                  className="flex-1 text-sm"
                  placeholder="#6b7280"
                />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <Button
            onClick={onApplyPreferences}
            disabled={isLoading}
            className="w-full"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Apply Preferences to Design
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
```

### Success Criteria

#### Automated Verification:
- [ ] Component compiles without TypeScript errors
- [ ] No linting errors: `npm run lint`

#### Manual Verification:
- [ ] All preference options are selectable
- [ ] Color pickers work and update the hex input
- [ ] Panel collapses and expands properly
- [ ] Visual feedback shows selected options clearly

**Implementation Note**: After completing this phase, verify the component renders correctly in isolation before integration.

---

## Phase 3: Enhanced AI Chat Interface

### Overview
Rebuild the AI chat interface to support rich conversations with proactive suggestions and better UX.

### Changes Required

#### 1. Create Enhanced Chat Interface Component

**File**: `src/components/ui/AIDesignChat.tsx`

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  Lightbulb,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  changesSummary?: string | null;
}

interface AIDesignChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
  isInitializing: boolean;
}

export function AIDesignChat({
  messages,
  onSendMessage,
  onSuggestionClick,
  isLoading,
  isInitializing
}: AIDesignChatProps) {
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input after loading completes
  useEffect(() => {
    if (!isLoading && !isInitializing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, isInitializing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      onSuggestionClick(suggestion);
    }
  };

  // Get the last assistant message's suggestions
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  const currentSuggestions = lastAssistantMessage?.suggestions || [];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-base flex items-center">
          <Bot className="h-4 w-4 mr-2 text-blue-500" />
          AI Design Assistant
          {isInitializing && (
            <Badge variant="secondary" className="ml-2">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Analyzing your email...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 && !isInitializing && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Your AI design assistant is ready!</p>
              <p className="text-xs mt-1">I'll help you create the perfect email.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {/* Message Bubble */}
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.role === 'assistant' && (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                      {/* Changes Summary */}
                      {msg.changesSummary && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center text-xs text-green-600">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Changes made: {msg.changesSummary}
                          </div>
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              {/* Inline Suggestions (for assistant messages) */}
              {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="pl-6 space-y-1">
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Quick suggestions:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                        className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600
                                   hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Designing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Suggestions Bar (when chat has messages) */}
        {currentSuggestions.length > 0 && messages.length > 0 && !isLoading && (
          <div className="px-4 py-2 border-t bg-gray-50">
            <div className="flex items-center gap-2 overflow-x-auto">
              <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0" />
              {currentSuggestions.slice(0, 3).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white border
                             hover:bg-blue-50 hover:border-blue-300 transition-colors
                             whitespace-nowrap flex-shrink-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tell me how to improve your email..."
              disabled={isLoading || isInitializing}
              className="flex-1"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading || isInitializing}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Try: "Make it more colorful" or "Add a call-to-action button"
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Success Criteria

#### Automated Verification:
- [ ] Component compiles without TypeScript errors
- [ ] No linting errors: `npm run lint`

#### Manual Verification:
- [ ] Messages display correctly with proper styling
- [ ] Suggestions are clickable and trigger onSuggestionClick
- [ ] Auto-scroll works when new messages arrive
- [ ] Input is focused after loading completes
- [ ] Loading states display properly

**Implementation Note**: After completing this phase, test the component in isolation before integration.

---

## Phase 4: Integrate Enhanced Components into EmailBeautifyDialog

### Overview
Replace the existing basic chat interface with the new enhanced components and wire up the conversation API.

### Changes Required

#### 1. Update EmailBeautifyDialog

**File**: `src/components/ui/EmailBeautifyDialog.tsx`

Replace the entire file with the enhanced version that integrates all new components:

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Alert, AlertDescription } from './alert';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Eye,
  Monitor,
  Smartphone,
  Loader2,
  AlertCircle,
  Mail,
  CheckCircle2,
  Code,
  RotateCcw
} from 'lucide-react';
import { AIDesignChat } from './AIDesignChat';
import { DesignPreferencesPanel, DesignPreferences } from './DesignPreferencesPanel';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  changesSummary?: string | null;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface EmailBeautifyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  subject: string;
  onConfirm: (htmlContent: string, plainTextFallback: string, enhancedSubject: string) => void;
  orgName?: string;
}

const DEFAULT_PREFERENCES: DesignPreferences = {
  styleMood: 'professional',
  tone: 'friendly',
  density: 'balanced',
  primaryColor: '#3b82f6',
  secondaryColor: '#6b7280'
};

export function EmailBeautifyDialog({
  isOpen,
  onClose,
  message,
  subject,
  onConfirm,
  orgName = 'Your Organization'
}: EmailBeautifyDialogProps) {
  // Core state
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [plainTextFallback, setPlainTextFallback] = useState<string>('');
  const [enhancedSubject, setEnhancedSubject] = useState<string>('');

  // View state
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  // Preferences state
  const [preferences, setPreferences] = useState<DesignPreferences>(DEFAULT_PREFERENCES);
  const [preferencesCollapsed, setPreferencesCollapsed] = useState(true);

  // Generate initial email and get AI greeting
  const initializeEmail = useCallback(async () => {
    if (!message || !subject) return;

    setIsInitializing(true);
    setError(null);
    setChatMessages([]);
    setConversationHistory([]);

    try {
      // First, generate the initial HTML email
      const beautifyResponse = await fetch('/api/email-beautify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          subject,
          template: 'professional',
          orgName
        }),
      });

      if (!beautifyResponse.ok) {
        throw new Error('Failed to generate initial email');
      }

      const beautifyData = await beautifyResponse.json();
      setHtmlContent(beautifyData.htmlContent);
      setPlainTextFallback(beautifyData.plainTextFallback);
      setEnhancedSubject(beautifyData.aiEnhancements?.enhancedSubject || subject);
      setPreviewKey(prev => prev + 1);

      // Now get AI greeting with suggestions
      const greetingResponse = await fetch('/api/email-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '',
          conversationHistory: [],
          currentHtml: beautifyData.htmlContent,
          originalContent: { subject, message, orgName },
          preferences,
          isInitialGreeting: true
        }),
      });

      if (greetingResponse.ok) {
        const greetingData = await greetingResponse.json();

        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: greetingData.message,
          timestamp: new Date(),
          suggestions: greetingData.suggestions || [],
          changesSummary: null
        };

        setChatMessages([aiMessage]);
        setConversationHistory([
          { role: 'assistant', content: greetingData.message }
        ]);
      }

    } catch (error) {
      console.error('Error initializing email:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize');
    } finally {
      setIsInitializing(false);
    }
  }, [message, subject, orgName, preferences]);

  // Initialize when dialog opens
  useEffect(() => {
    if (isOpen && message && subject) {
      initializeEmail();
    }
  }, [isOpen]); // Only trigger on dialog open, not on every dependency change

  // Handle sending a chat message
  const handleSendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || !htmlContent) return;

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setError(null);

    // Update conversation history
    const newHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];
    setConversationHistory(newHistory);

    try {
      const response = await fetch('/api/email-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: newHistory,
          currentHtml: htmlContent,
          originalContent: { subject, message, orgName },
          preferences,
          isInitialGreeting: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions || [],
        changesSummary: data.changesSummary
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setConversationHistory(prev => [
        ...prev,
        { role: 'assistant', content: data.message }
      ]);

      // Update HTML if changes were made
      if (data.updatedHtml) {
        setHtmlContent(data.updatedHtml);
        setPreviewKey(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error in conversation:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [htmlContent, conversationHistory, subject, message, orgName, preferences]);

  // Handle clicking a suggestion
  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSendMessage(suggestion);
  }, [handleSendMessage]);

  // Handle applying preferences
  const handleApplyPreferences = useCallback(async () => {
    const preferencesMessage = `Please redesign this email with these preferences:
- Style: ${preferences.styleMood}
- Tone: ${preferences.tone}
- Density: ${preferences.density}
- Primary color: ${preferences.primaryColor}
- Secondary color: ${preferences.secondaryColor}`;

    handleSendMessage(preferencesMessage);
    setPreferencesCollapsed(true);
  }, [preferences, handleSendMessage]);

  // Handle confirmation
  const handleConfirm = () => {
    if (htmlContent) {
      onConfirm(htmlContent, plainTextFallback, enhancedSubject);
      onClose();
    }
  };

  // Handle reset
  const handleReset = () => {
    initializeEmail();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            AI Email Design Assistant
          </DialogTitle>
          <DialogDescription>
            Chat with AI to design your perfect email. Ask for changes, get suggestions, and see updates in real-time.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
          {/* Left Panel - Chat and Preferences */}
          <div className="flex flex-col overflow-hidden">
            {/* Preferences Panel */}
            <DesignPreferencesPanel
              preferences={preferences}
              onPreferencesChange={setPreferences}
              onApplyPreferences={handleApplyPreferences}
              isCollapsed={preferencesCollapsed}
              onToggleCollapse={() => setPreferencesCollapsed(!preferencesCollapsed)}
              isLoading={isLoading}
            />

            {/* Chat Interface */}
            <div className="flex-1 overflow-hidden">
              <AIDesignChat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onSuggestionClick={handleSuggestionClick}
                isLoading={isLoading}
                isInitializing={isInitializing}
              />
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex flex-col overflow-hidden">
            {/* Preview Controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isLoading || isInitializing}
                  title="Start over"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('desktop')}
                    className="rounded-r-none"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('mobile')}
                    className="rounded-l-none"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="mb-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Preview Tabs */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="preview" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview" className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex items-center">
                    <Code className="h-4 w-4 mr-1" />
                    HTML
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="flex-1 mt-3 overflow-hidden">
                  <div
                    className={`h-full border rounded-lg overflow-hidden transition-all ${
                      viewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                    }`}
                  >
                    {htmlContent ? (
                      <iframe
                        key={previewKey}
                        srcDoc={htmlContent}
                        className="w-full h-full"
                        title="Email Preview"
                        style={{
                          border: 'none',
                          width: viewMode === 'mobile' ? '375px' : '100%'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center text-gray-500">
                          {isInitializing ? (
                            <>
                              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin opacity-50" />
                              <p>Generating your email...</p>
                            </>
                          ) : (
                            <>
                              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>Email preview will appear here</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="code" className="flex-1 mt-3 overflow-hidden">
                  <div className="h-full border rounded-lg overflow-hidden">
                    <pre className="h-full p-4 text-xs bg-gray-50 overflow-auto whitespace-pre-wrap">
                      <code>{htmlContent || 'HTML will appear here...'}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {htmlContent && !isLoading && !isInitializing && (
              <Badge variant="secondary" className="flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Email Ready
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!htmlContent || isLoading || isInitializing}
            >
              <Mail className="h-4 w-4 mr-2" />
              Use This Email
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Success Criteria

#### Automated Verification:
- [ ] All TypeScript compiles: `npm run build`
- [ ] No linting errors: `npm run lint`
- [ ] Application starts without errors: `npm run dev`

#### Manual Verification:
- [ ] Dialog opens and shows loading state while initializing
- [ ] AI greeting appears with 3-4 specific suggestions
- [ ] Clicking suggestions sends them as messages
- [ ] User messages appear in chat and trigger AI responses
- [ ] HTML preview updates in real-time when AI makes changes
- [ ] Design preferences panel works and affects AI output
- [ ] Desktop/mobile preview toggle works
- [ ] "Use This Email" button correctly passes data to parent
- [ ] Conversation maintains context across multiple turns
- [ ] Reset button starts fresh

**Implementation Note**: This is the final integration phase. Test thoroughly before considering complete.

---

## Phase 5: Final Polish and Edge Cases

### Overview
Add finishing touches, handle edge cases, and optimize the user experience.

### Changes Required

#### 1. Add Typing Indicator Enhancement

Update `AIDesignChat.tsx` to show a more engaging typing indicator:

```typescript
// Add this component inside AIDesignChat.tsx

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-gray-100 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-blue-500" />
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm text-gray-500">Designing your email...</span>
      </div>
    </div>
  </div>
);
```

#### 2. Add Quick Action Buttons

Add frequently used actions as quick buttons in the chat:

```typescript
// Add to AIDesignChat.tsx before the input area

const QUICK_ACTIONS = [
  { label: 'More colorful', icon: '🎨' },
  { label: 'Add button', icon: '🔘' },
  { label: 'Simplify', icon: '✨' },
  { label: 'Make bolder', icon: '💪' },
];

// Render quick actions when chat is empty or after AI response
<div className="flex gap-2 px-4 pb-2">
  {QUICK_ACTIONS.map((action) => (
    <button
      key={action.label}
      onClick={() => onSendMessage(action.label)}
      disabled={isLoading}
      className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200
                 transition-colors disabled:opacity-50"
    >
      {action.icon} {action.label}
    </button>
  ))}
</div>
```

#### 3. Error Recovery

Add retry functionality for failed requests:

```typescript
// Add to EmailBeautifyDialog.tsx

const [retryCount, setRetryCount] = useState(0);
const MAX_RETRIES = 2;

// In the catch block of handleSendMessage:
if (retryCount < MAX_RETRIES) {
  setRetryCount(prev => prev + 1);
  // Auto-retry after 1 second
  setTimeout(() => handleSendMessage(userMessage), 1000);
} else {
  setRetryCount(0);
  // Show error message
}
```

### Success Criteria

#### Automated Verification:
- [ ] All TypeScript compiles: `npm run build`
- [ ] No linting errors: `npm run lint`

#### Manual Verification:
- [ ] Typing indicator animates smoothly
- [ ] Quick action buttons work and send appropriate messages
- [ ] Failed requests retry automatically
- [ ] All edge cases handled gracefully

---

## Testing Strategy

### Unit Tests

Create test file: `src/components/ui/__tests__/AIDesignChat.test.tsx`

Test cases:
- Messages render correctly
- User input is captured
- Suggestions are clickable
- Loading state disables input
- Auto-scroll works

### Integration Tests

Test cases:
- Full conversation flow from initial greeting to customization
- Preferences panel affects AI output
- HTML updates reflect in preview
- Multiple turn conversation maintains context

### Manual Testing Steps

1. **Initial Load Test**
   - Open Beautify Email dialog
   - Verify AI greeting appears with suggestions
   - Check that initial email is generated correctly

2. **Conversation Flow Test**
   - Send "Make it more colorful"
   - Verify HTML updates in preview
   - Send "Add a call-to-action button"
   - Verify button appears in preview
   - Send "Change the button color to red"
   - Verify incremental change works

3. **Preferences Test**
   - Expand preferences panel
   - Select "Bold" style and "Urgent" tone
   - Click "Apply Preferences"
   - Verify email redesign matches preferences

4. **Edge Cases**
   - Test with very long email content
   - Test with minimal content
   - Test rapid message sending
   - Test network error recovery

---

## Performance Considerations

- Conversation history is trimmed if it exceeds 10 messages to prevent token limit issues
- HTML preview uses iframe with key-based refresh to prevent memory leaks
- AI responses use streaming where possible for faster perceived performance
- Preferences are stored in component state (future: persist to localStorage)

---

## Migration Notes

This is a new feature built on top of existing functionality. No data migration required.

The existing `/api/ai-assist` endpoint remains functional for backwards compatibility with other features using it.

---

## Future Enhancements (Out of Scope)

- Save favorite designs as templates
- A/B testing integration
- Analytics on design choices
- Collaborative design sessions
- Image upload and placement
- Custom font support
- Export to other email platforms

---

## References

- Current implementation: `src/components/ui/EmailBeautifyDialog.tsx`
- AI assist API: `src/app/api/ai-assist/route.ts`
- Email beautify API: `src/app/api/email-beautify/route.ts`
- OpenAI API documentation: https://platform.openai.com/docs
