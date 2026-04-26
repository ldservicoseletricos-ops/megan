import express from "express";
import { appConfig } from "../config/app.config.js";
const router = express.Router();

router.get("/health",(req,res)=>{
 res.json({
   ok:true,
   app: appConfig.appName,
   version: appConfig.version,
   timezone: appConfig.timezone,
   time: new Date().toISOString(),
   productionReady:true
 });
});

export default router;
