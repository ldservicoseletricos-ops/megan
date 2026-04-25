export const appConfig = {
  appName: "Megan OS",
  version: "21.0",
  timezone: process.env.DEFAULT_TIMEZONE || "America/Sao_Paulo",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  port: Number(process.env.PORT || 10000)
};
