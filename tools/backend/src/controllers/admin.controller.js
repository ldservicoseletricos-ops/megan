export function adminController(req, res) {
  res.json({
    ok: true,
    status: 'admin_online',
    metrics: {
      users: 1,
      plans: 3,
      chats: 1,
    },
  });
}
