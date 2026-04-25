function buildLessonsLedger(episodes = []) { return { ok: true, lessons: (episodes || []).map((episode) => ({ id: `lesson-${episode.id}`, sourceEpisodeId: episode.id, title: episode.title, lesson: episode.lesson, impact: episode.impact, tags: episode.tags || [], createdAt: episode.createdAt })).slice(0, 80), generatedAt: new Date().toISOString() }; }
module.exports = { buildLessonsLedger };
