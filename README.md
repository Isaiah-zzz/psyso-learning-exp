# psyso-learning-exp

## Setup

1. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. API keys:
   - Copy `api-key.js` to `client/src/config/api-key.js`

3. Start the servers:
   ```bash
   empirica
   ```
4. Go to /admin to start experiments, config treatments (with teachback and without)

5. Go to player (3000) page for the actual experiments after starting

4. Export data:
   ```bash
   empirica export
   ```


## Experiment Structure

- **Debrief**: Introduction to the experiment
- **AI Teaching**: Interactive learning phase with AI chatbot
- **Participant Teaching**: Teaching back phase (optional, controlled by treatment)
- **Quiz**: Multiple choice comprehension test
- **Exit Survey**: Post-experiment survey

## Treatments - config in admin page

- `with teachback` - Participants teach the material back
- `without teachback` - Participants only learn, no teaching back

