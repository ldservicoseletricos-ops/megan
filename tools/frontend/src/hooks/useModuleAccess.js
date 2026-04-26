import { useEffect, useState } from 'react';
import { getModuleSession, getPlans, listSubscriptions } from '../lib/billingApi';

export function useModuleAccess(enabled = true, refreshKey = 0) {
  const [state, setState] = useState({ loading: true, access: {}, plans: [], user: null, subscription: null, error: '' });

  useEffect(() => {
    if (!enabled) {
      setState({ loading: false, access: {}, plans: [], user: null, subscription: null, error: '' });
      return;
    }
    let active = true;
    Promise.all([getModuleSession(), getPlans(), listSubscriptions()]).then(([session, plans, subscriptions]) => {
      if (!active) return;
      const mySub = (subscriptions.items || []).find((item) => item.userId === session.user.id && item.status !== 'canceled') || null;
      setState({ loading: false, access: session.access || {}, plans: plans.items || [], user: session.user, subscription: mySub, error: '' });
    }).catch((error) => {
      if (!active) return;
      setState({ loading: false, access: {}, plans: [], user: null, subscription: null, error: error.message });
    });
    return () => { active = false; };
  }, [enabled, refreshKey]);

  return state;
}
