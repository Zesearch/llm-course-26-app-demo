import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a fusion chef and recipe transformer. Your task is to transform recipes based on user preferences.

Given a recipe extracted from an image, you must:
1. Convert it to the target cuisine - adapt flavor profiles, spices, and cooking techniques authentically
2. Apply dietary restrictions strictly - substitute ingredients and adjust the recipe accordingly
3. Adapt instructions for the selected appliance - rewrite cooking times, temperatures, and methods for the specified appliance
4. Preserve taste quality and realism - the recipe must be practical and delicious

Always return valid JSON with exactly this structure (no markdown, no code blocks):
{
  "title": "string",
  "ingredients": ["string", "string", ...],
  "steps": ["string", "string", ...]
}

Be thorough - include all necessary ingredients with quantities and clear, detailed step-by-step instructions.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured. Add it to .env.local' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image, cuisine, diet, appliance } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const dietStr =
      Array.isArray(diet) && diet.length > 0
        ? diet.join(', ')
        : 'No dietary restrictions';
    const userPrompt = `Transform this recipe with:
- Target cuisine: ${cuisine || 'Italian'}
- Dietary restrictions: ${dietStr}
- Cooking appliance: ${appliance || 'Oven'}

Extract the recipe from the image, then transform it according to these specifications. Return the new recipe as JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: image.startsWith('data:')
                  ? image
                  : `data:image/jpeg;base64,${image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content) as {
      title?: string;
      ingredients?: string[];
      steps?: string[];
    };

    return NextResponse.json({
      title: parsed.title || 'Remixed Recipe',
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    });
  } catch (err) {
    console.error('Remix API error:', err);
    const message =
      err instanceof Error ? err.message : 'Failed to remix recipe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
