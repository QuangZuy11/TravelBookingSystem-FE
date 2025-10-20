// AI Itinerary Prompts - frontend helper module
// Exports system prompt, user prompt template and helpers for FE usage.

export const SYSTEM_PROMPT = `You are an itinerary generation assistant. When given a request and a set of POIs, return strictly valid JSON that follows the agreed schema. Do not add any free text outside the JSON.`;

export const USER_PROMPT_TEMPLATE = ({
  destination = '',
  duration_days = 1,
  start_date = null,
  end_date = null,
  participant_number = 1,
  budget_level = 'medium',
  preferences = [],
  pois = []
}) => {
  // POIs should be passed as JSON-stringified array by the caller
  const poisJson = JSON.stringify(pois || []);
  return `Input:\n- destination: ${destination}\n- duration_days: ${duration_days}\n- start_date: ${start_date || ''}\n- end_date: ${end_date || ''}\n- participant_number: ${participant_number}\n- budget_level: ${budget_level}\n- preferences: ${JSON.stringify(preferences)}\n\nPOIs: ${poisJson}\n\nTask:\nCreate an itinerary split into ${duration_days} days for destination ${destination}. Use provided POIs where possible (match by id). Each day should have a title and an ordered activities array. For each activity include start_time, end_time, duration_hours, description, cost and optional fields when appropriate.\n\nRespond ONLY with valid JSON that matches the schema. Do not add commentary.`;
};

// Schema description for quick validation on the client
export const ITINERARY_SCHEMA = {
  type: 'object',
  properties: {
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day_number: { type: 'number' },
          title: { type: 'string' },
          description: { type: 'string' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                activity_name: { type: 'string' },
                poi_id: { type: ['string', 'null'] },
                start_time: { type: 'string' },
                end_time: { type: 'string' },
                duration_hours: { type: 'number' },
                description: { type: 'string' },
                cost: { type: 'number' },
                optional: { type: 'boolean' }
              },
              required: ['activity_name','start_time','end_time','duration_hours','description','cost','optional']
            }
          }
        },
        required: ['day_number','title','activities']
      }
    }
  },
  required: ['days']
};

export default {
  SYSTEM_PROMPT,
  USER_PROMPT_TEMPLATE,
  ITINERARY_SCHEMA
};
