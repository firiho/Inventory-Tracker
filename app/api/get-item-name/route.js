import OpenAI from "openai";
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  const { imageUrl } = await request.json();

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
  }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Provide the common name of the item in this image. Just its name. No article, no other words, no more explanation, just the name of the item shown in the picture." },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      });

      return NextResponse.json({ name: response.choices[0].message.content });
  } catch (error) {
    console.error("Error with OpenAI request:", error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ allowed: ['POST'] }, { headers: { 'Allow': 'POST' } });
}