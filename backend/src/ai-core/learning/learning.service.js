import { listInteractions } from "../../db/repositories/interaction.repository.js";
import { extractLessons } from "./lesson-extractor.js";
import { detectPatterns } from "./pattern-detector.js";
import { updateHeuristics } from "./heuristic-updater.js";

export function learnFromInteraction({ userId, message, classification, evaluation, criticReview, adaptiveContext }) {
  const interactions = listInteractions().filter((item) => item.userId === userId);

  const lessons = extractLessons({
    message,
    classification,
    evaluation,
    criticReview
  });

  const patterns = detectPatterns({
    interactions,
    message
  });

  const createdRules = updateHeuristics({
    userId,
    patterns
  });

  return {
    lessons,
    patterns,
    createdRules,
    adaptationInsights: {
      selectedMode: adaptiveContext?.adaptiveProfile?.selectedMode || "adaptive_balanced",
      topPriorities: (adaptiveContext?.priorities || []).map((item) => item.slug),
      profileConfidence: adaptiveContext?.userProfile?.confidence || 0
    }
  };
}
