function rankIdeas(ideas = []) {
  return ideas.map((idea, index) => ({
    ...idea,
    rank: index + 1,
    decision: idea.score >= 85 ? 'prioritize' : idea.score >= 75 ? 'incubate' : 'observe',
  }));
}
module.exports = { rankIdeas };
