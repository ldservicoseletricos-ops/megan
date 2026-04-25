import { Router } from "express";
import { getUserProfile, updateUserProfile } from "../lib/store.js";

const router = Router();

function normalizeText(value) {
  return String(value || "").trim();
}

router.get("/:userId?", (req, res) => {
  const userId = normalizeText(req.params.userId || req.query.userId || "luiz") || "luiz";
  const profile = getUserProfile(userId);

  return res.json({
    ok: true,
    userId,
    profile,
  });
});

router.post("/:userId/places", (req, res) => {
  const userId = normalizeText(req.params.userId || "luiz") || "luiz";
  const alias = normalizeText(req.body?.alias).toLowerCase();
  const label = normalizeText(req.body?.label);
  const lat = Number(req.body?.lat);
  const lon = Number(req.body?.lon);

  if (!alias || !label) {
    return res.status(400).json({ ok: false, error: "alias e label são obrigatórios." });
  }

  const profile = updateUserProfile(userId, (current) => ({
    ...current,
    knownPlaces: {
      ...(current.knownPlaces || {}),
      [alias]: {
        alias,
        label,
        shortName: label.split(",")[0].trim() || label,
        latitude: Number.isFinite(lat) ? lat : null,
        longitude: Number.isFinite(lon) ? lon : null,
        useCount: Number(current?.knownPlaces?.[alias]?.useCount || 0),
        lastUsedAt: new Date().toISOString(),
      },
    },
  }));

  return res.json({ ok: true, userId, profile });
});

router.patch("/:userId/preferences", (req, res) => {
  const userId = normalizeText(req.params.userId || "luiz") || "luiz";
  const incoming = req.body?.preferences;

  if (!incoming || typeof incoming !== "object") {
    return res.status(400).json({ ok: false, error: "preferences inválidas." });
  }

  const profile = updateUserProfile(userId, (current) => ({
    ...current,
    preferences: {
      ...(current.preferences || {}),
      ...incoming,
    },
  }));

  return res.json({ ok: true, userId, profile });
});

export default router;
