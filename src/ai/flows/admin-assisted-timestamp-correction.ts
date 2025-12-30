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
  statusTimestamps: z.record(z.string(), z.string()).describe('All status timestamps for the shipment, as a map of status type to ISO string timestamp.'),
  shipmentHistory: z.string().describe('Historical data of similar shipments, including status timestamps.'),
  notes: z.string().optional().describe('Additional notes from the admin about the potential error.'),
});
export type CorrectTimestampInput = z.infer<typeof CorrectTimestampInputSchema>;

const CorrectTimestampOutputSchema = z.object({
  suggestedTimestamp: z.string().describe('The AI-suggested corrected timestamp as an ISO string.'),
  confidence: z.number().describe('A confidence score (0-1) indicating the AI confidence in the suggested timestamp.'),
  explanation: z.string().describe('An explanation of why the AI suggests this correction.'),
});
export type CorrectTimestampOutput = z.infer<typeof CorrectTimestampOutputSchema>;

export async function correctTimestamp(input: CorrectTimestampInput): Promise<CorrectTimestampOutput> {
  return correctTimestampFlow(input);
}

const correctTimestampPrompt = ai.definePrompt({
  name: 'correctTimestampPrompt',
  input: {schema: CorrectTimestampInputSchema},
  output: {schema: CorrectTimestampOutputSchema},
  prompt: `You are an AI assistant helping a logistics admin correct potentially incorrect timestamps in shipment logs.

The admin has identified a potentially incorrect timestamp for shipment ID {{shipmentId}}, status type {{statusType}}. The current incorrect timestamp is {{incorrectTimestamp}}.

Here is the history of the shipment, including all other status timestamps:
{{#each (sortObject statusTimestamps)}}  {{@key}}: {{this}}
{{/each}}

Here is historical data from similar shipments:
{{shipmentHistory}}

{{#if notes}}
Additional notes from the admin: {{notes}}
{{/if}}

Based on this information, suggest a corrected timestamp and explain your reasoning.  Also provide a confidence level between 0 and 1 reflecting your certainty in the suggestion.

Output in JSON format:
{{outputFormat schema=CorrectTimestampOutputSchema}}
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
