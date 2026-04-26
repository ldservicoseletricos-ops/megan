export const DEFAULT_RULES = [
  {
    title: "preserve_existing_work",
    description: "Preservar o que já funciona e alterar somente o necessário.",
    priority: 100
  },
  {
    title: "prefer_complete_files_when_requested",
    description: "Se o usuário pedir conteúdo completo para colar, entregar completo.",
    priority: 95
  },
  {
    title: "use_critic_for_complex_tasks",
    description: "Aplicar revisão crítica em tarefas complexas ou de risco.",
    priority: 90
  },
  {
    title: "learn_from_repeated_feedback",
    description: "Registrar padrões repetidos e transformar em aprendizado.",
    priority: 85
  }
];
