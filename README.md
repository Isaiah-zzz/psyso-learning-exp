# psyso-learning-exp

Learning by Teaching Experiment - Empirica Implementation

## Setup

1. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. Configure API keys:
   - Copy `client/src/config/api-key.example.js` to `client/src/config/api-key.js` and add your Gemini API key
   - Copy `server/src/config/api-key.example.js` to `server/src/config/api-key.js` and add your Gemini API key

3. Start the servers:
   ```bash
   # Terminal 1: API Server
   cd server && npm run api
   
   # Terminal 2: Empirica Server
   cd server && npm run dev
   
   # Terminal 3: Client
   cd client && npm run dev
   ```

## Experiment Structure

- **Debrief**: Introduction to the experiment
- **AI Teaching**: Interactive learning phase with AI chatbot
- **Participant Teaching**: Teaching back phase (optional, controlled by treatment)
- **Quiz**: Multiple choice comprehension test
- **Exit Survey**: Post-experiment survey

## Treatments

- `teachBack: true` - Participants teach the material back
- `teachBack: false` - Participants only learn, no teaching back

