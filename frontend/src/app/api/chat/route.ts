import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured on the server' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const { message, history } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build conversation history for context
    const messages = [
      {
        role: 'system' as const,
        content: `You are MediSync, a helpful AI medical assistant for symptom checking. 
        You are NOT a replacement for professional medical advice. 
        Always advise users to consult with a healthcare professional for diagnosis and treatment.
        Provide informative responses about symptoms, possible causes, and general health recommendations.
        Ask clarifying questions about symptoms and medical history when needed.`,
      },
      ...(history || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiMessage = response.choices[0]?.message?.content || 'Unable to generate response';

    return NextResponse.json({
      response: aiMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
