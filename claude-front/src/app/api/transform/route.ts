import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { type TransformRequest, mockTransformResponse } from '@/lib/contracts';

const UI_AGENT_PROMPT = `You are a UI agent that annotates web pages with BS detection results.

Your task is to take the original HTML of a webpage and a BS detection report, then modify the HTML to visually highlight BS claims with inline annotations.

## Instructions:

1. Find the exact text of each claim mentioned in the report within the HTML
2. Replace each claim with an annotated version using inline styles (no external CSS needed)
3. Use these styles for different verdicts:
   - FALSE/INFLATED claims: Red background (#fecaca), strikethrough text, add correction in parentheses with green background (#dcfce7)
   - UNVERIFIABLE claims: Yellow/amber background (#fef3c7), add "(unverifiable)" note
   - VERIFIED claims: Subtle green background (#d1fae5), add checkmark "✓"
   - PARTIAL claims: Light blue background (#dbeafe)

4. Add a fixed position banner at the top of the page with the overall assessment:
   - Red banner for mostly BS
   - Yellow banner for mixed/caution
   - Green banner for mostly verified

5. Keep ALL other HTML intact - only modify the specific claim text
6. Add necessary inline styles within the HTML (style tags or inline styles)
7. Return complete, valid HTML

## Example transformations:

Original: <p>$80M ARR growing 3x</p>
Transformed: <p><span style="background:#fecaca;text-decoration:line-through">$80M ARR</span> <span style="background:#dcfce7;font-weight:bold">(Actually ~$8-10M based on team size)</span> growing 3x</p>

Original: <p>500+ enterprise customers</p>
Transformed: <p><span style="background:#fef3c7">500+ enterprise customers</span> <span style="color:#92400e;font-size:0.9em">(unverifiable)</span></p>

Original: <p>Founded by ex-Google engineers</p>
Transformed: <p><span style="background:#d1fae5">Founded by ex-Google engineers</span> <span style="color:#047857">✓</span></p>

Return ONLY the complete modified HTML, nothing else.`;

export async function POST(req: Request) {
  try {
    const { report, html, url }: TransformRequest = await req.json();

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      // Return mock response for development
      console.log('No OPENROUTER_API_KEY found, returning mock response');
      return Response.json(mockTransformResponse);
    }

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const { text } = await generateText({
      model: openrouter.chat('anthropic/claude-sonnet-4'),
      system: UI_AGENT_PROMPT,
      prompt: `Here is the BS detection report:

${report}

Here is the original HTML of the page at ${url}:

${html}

Rewrite the HTML with BS annotations. Return only the complete modified HTML.`,
    });

    // Extract just the HTML if the model wrapped it in markdown code blocks
    let cleanedHtml = text;
    const htmlMatch = text.match(/```html\n?([\s\S]*?)\n?```/);
    if (htmlMatch) {
      cleanedHtml = htmlMatch[1];
    }

    return Response.json({ html: cleanedHtml });
  } catch (error) {
    console.error('Transform error:', error);

    // Return mock response on error for development
    return Response.json(mockTransformResponse);
  }
}
