const express = require('express');
const mobile = require('../services/mobile-navigation.service');
const router = express.Router();

router.post('/route', (req, res) => {
  try {
    return res.json({
      ok: true,
      route: mobile.buildRoute(req.body || {}),
      driveMode: mobile.buildDriveMode(),
      mode: 'drive_war_room_live_ops_v36',
    });
  } catch (error) {
    return res.status(400).json({ ok: false, reason: error.message });
  }
});

router.post('/live-snapshot', (req, res) => {
  try {
    return res.json({
      ok: true,
      route: mobile.buildRoute(req.body || {}),
      refreshedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(400).json({ ok: false, reason: error.message });
  }
});

router.post('/push/test', (_req, res) => {
  res.json({
    ok: true,
    sent: true,
    notification: {
      title: 'Megan V36',
      body: 'War Room Live Ops ativo com alertas críticos centralizados, metas ao vivo e escalonamento automático.',
      level: 'danger',
    },
  });
});

router.get('/traffic-feed', (_req, res) => {
  res.json(mobile.buildTrafficFeed());
});


router.get('/command-center/status', (_req, res) => {
  const driveMode = mobile.buildDriveMode();
  const route = mobile.buildRoute({ destination: 'Painel executivo' });
  res.json({
    ok: true,
    version: '36.0.0',
    driveMode,
    commandCenter: route.commandCenter,
    traffic: route.traffic,
    incidents: route.incidents,
  });
});


router.get('/fleet-ai/status', (_req, res) => {
  const route = mobile.buildRoute({ destination: 'Painel Governance' });
  res.json({
    ok: true,
    version: '36.0.0',
    fleetAi: route.fleetAi,
    centralizedAlerts: route.centralizedAlerts,
    routeHistory: route.routeHistory,
  });
});


router.get('/fleet-admin/status', (_req, res) => {
  const route = mobile.buildRoute({ destination: 'Painel Governance Admin' });
  res.json({
    ok: true,
    version: '36.0.0',
    fleetAdmin: route.fleetAdmin,
    centralizedAlerts: route.centralizedAlerts,
    enterprisePanel: route.enterprisePanel,
  });
});

router.get('/drive-mode', (_req, res) => {
  res.json({
    ok: true,
    version: '36.0.0',
    driveMode: mobile.buildDriveMode(),
    features: [
      'full_screen',
      'live_map',
      'continuous_gps',
      'premium_voice',
      'chat_overlay',
      'strong_visual_alerts',
      'traffic_feed',
      'radar_alerts',
      'incident_cards',
      'alternative_routes',
      'premium_route_drawing',
      'auto_night_mode',
      'lane_focus_panel',
      'hud_direction_mode',
      'route_progress_bar',
      'danger_meter',
      'autopilot_assist',
      'predictive_traffic',
      'smart_departure_advisor',
      'frequent_routes_learning',
      'fatigue_alerts',
      'fuel_stop_advisor',
      'command_center',
      'camera_telemetry_panel',
      'voice_command_center',
      'fleet_mode_preview',
      'executive_travel_panel',
      'telemetry_pro',
      'camera_safety',
      'enterprise_panel',
      'web_admin_governance',
      'audit_trail',
      'access_profiles',
      'enterprise_command_cloud',
      'multi_branch_dashboard',
      'corporate_master_center',
      'enterprise_control_tower',
      'sla_watch',
      'executive_command_queue',
    ],
  });
});

router.get('/enterprise-live-ops/status', (_req, res) => {
  res.json(mobile.buildEnterpriseLiveOps());
});


router.get('/governance/status', (_req, res) => {
  res.json(mobile.buildGovernanceStatus());
});

router.get('/enterprise-command-cloud/status', (_req, res) => {
  res.json(mobile.buildEnterpriseCommandCloud());
});


router.get('/control-tower/status', (_req, res) => {
  res.json(mobile.buildControlTowerStatus());
});


router.get('/war-room/status', (_req, res) => {
  res.json(mobile.buildWarRoomStatus());
});

module.exports = router;
