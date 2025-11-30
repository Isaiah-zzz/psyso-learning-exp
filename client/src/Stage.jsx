import {
  usePlayer,
  usePlayers,
  useRound,
  useStage,
} from "@empirica/core/player/classic/react";
import { Loading } from "@empirica/core/player/react";
import React from "react";
import { ChatbotTeaching } from "./stages/ChatbotTeaching";
import { ChatbotTeachingBack } from "./stages/ChatbotTeachingBack";
import { Quiz } from "./stages/Quiz";

export function Stage() {
  const player = usePlayer();
  const players = usePlayers();
  const round = useRound();
  const stage = useStage();

  if (player.stage.get("submit")) {
    if (players.length === 1) {
      return <Loading />;
    }

    return (
      <div className="text-center text-gray-400 pointer-events-none">
        Please wait for other player(s).
      </div>
    );
  }

  const stageName = stage.get("name");

  switch (stageName) {
    case "AI Teaching":
      return <ChatbotTeaching />;
    case "Participant Teaching":
      return <ChatbotTeachingBack />;
    case "Quiz":
      return <Quiz />;
    default:
      return <div>Unknown stage: {stageName}</div>;
  }
}
