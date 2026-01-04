
'use server';

/**
 * @fileOverview An AI-powered tool that assists admins in identifying and correcting potentially incorrect timestamps in shipment logs.
 *
 * - correctTimestamp - A function that handles the timestamp correction process.
 * - CorrectTimestampInput - The input type for the correctTimestamp function.
 * - CorrectTimestampOutput - The return type for the correctTimestamp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectTimestampInputSchema = z.object({
  shipmentId: z.string().describe('The ID of the shipment to correct.'),
  statusType: z.string().describe('The type of status timestamp to correct (e.g., arrived_warehouse, departed_warehouse).'),
  incorrectTimestamp: z.string().describe('The incorrect timestamp as an ISO string.'),
  statusTimestamps: z.record(z.string(), z.string()).describe('All other status timestamps for the shipment, as a map of status type to ISO string timestamp.'),
  shipmentHistory: z.string().describe('A JSON string of historical data of similar shipments, including their status timestamps.'),
  notes: z.string().optional().describe('Additional notes from the admin about the potential error.'),
});
export type CorrectTimestampInput = z.infer<typeof CorrectTimestampInputSchema>;

const CorrectTimestampOutputSchema = z.object({
  suggestedTimestamp: z.string().describe('The AI-suggested corrected timestamp as an ISO string. This should be logically consistent with other timestamps.'),
  confidence: z.number().describe('A confidence score (0-1) indicating the AI confidence in the suggested timestamp.'),
  explanation: z.string().describe('An explanation of why the AI suggests this correction, considering the other timestamps and historical data.'),
});
export type CorrectTimestampOutput = z.infer<typeof CorrectTimestampOutputSchema>;

export async function correctTimestamp(input: CorrectTimestampInput): Promise<CorrectTimestampOutput> {
  return correctTimestampFlow(input);
}

const correctTimestampPrompt = ai.definePrompt({
  name: 'correctTimestampPrompt',
  input: {schema: CorrectTimestampInputSchema},
  output: {schema: CorrectTimestampOutputSchema},
  prompt: `You are an AI assistant helping a logistics admin correct an incorrect timestamp in a shipment log. Your primary goal is to ensure chronological consistency.

The admin has flagged an incorrect timestamp for shipment ID {{shipmentId}}.
The problematic status is '{{statusType}}' with the incorrect time: {{incorrectTimestamp}}.

Here is the context of the shipment's timeline. NOTE: The value for '{{statusType}}' is the INCORRECT one.
{{#each (sortObject statusTimestamps)}}
- {{@key}}: {{this}}
{{/each}}

Here is historical data from a few other shipments for context on typical timings:
{{shipmentHistory}}

{{#if notes}}
Additional notes from the admin: {{notes}}
{{/if}}

Your task is to suggest a new, corrected timestamp for '{{statusType}}'.
The new timestamp MUST be logically sound and chronologically correct with respect to the other timestamps for THIS shipment.
For example, 'start_loading' must come after 'arrived_at_warehouse' and before 'end_loading'.

Analyze the timeline and historical data to propose a realistic and consistent timestamp.

Provide a confidence score (0-1) and a brief explanation for your suggestion.
`,
});

const correctTimestampFlow = ai.defineFlow(
  {
    name: 'correctTimestampFlow',
    inputSchema: CorrectTimestampInputSchema,
    outputSchema: CorrectTimestampOutputSchema,
  },
  async input => {
    const {output} = await correctTimestampPrompt(input);
    return output!;
  }
);

    