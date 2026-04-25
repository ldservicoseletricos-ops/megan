import { getJson, postJson } from './api';

export const getPlans = () => getJson('/api/modules/plans');
export const getModuleSession = () => getJson('/api/modules/session');
export const listLeads = () => getJson('/api/crm/leads');
export const listSubscriptions = () => getJson('/api/billing/subscriptions');
export const listPayments = () => getJson('/api/billing/payments');
export const getPortalConfig = () => getJson('/api/billing/portal/config');
export const createSubscription = (planId) => postJson('/api/billing/subscription/create', { planId });
export const cancelSubscription = (subscriptionId) => postJson('/api/billing/subscription/cancel', { subscriptionId });
export const changePlan = (subscriptionId, planId) => postJson('/api/billing/subscription/change-plan', { subscriptionId, planId });
export const createPortalSession = () => postJson('/api/billing/portal/session', {});
