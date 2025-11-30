import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();

Empirica.onGameStart(({ game }) => {
  // Get treatment factors
  const treatment = game.get("treatment");
  const teachBack = treatment?.teachBack ?? true; // Default to true if not set
  
  // Create stages for the learning-by-teaching experiment
  const round = game.addRound({
    name: "Learning by Teaching Experiment",
  });
  
  // Stage 1: AI Teaching (5 minutes = 300 seconds)
  round.addStage({ name: "AI Teaching", duration: 300 });
  
  // Stage 2: Participant Teaching (5 minutes = 300 seconds) - only if teachBack is true
  if (teachBack) {
    round.addStage({ name: "Participant Teaching", duration: 300 });
  }
  
  // Stage 3: Quiz (no time limit, but we'll set a reasonable duration)
  round.addStage({ name: "Quiz", duration: 600 }); // 10 minutes for quiz
});

Empirica.onRoundStart(({ round }) => {});

Empirica.onStageStart(({ stage }) => {});

Empirica.onStageEnded(({ stage }) => {});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});
