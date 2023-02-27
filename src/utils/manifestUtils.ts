import { Activity, IntentFilter } from '../models/manifest';

export const INTENT_MAIN = 'android.intent.action.MAIN';
export const CATEGORY_LAUNCHER = 'android.intent.category.LAUNCHER';

export const isLauncherActivity = (activity: Activity) => {
  return activity.intentFilters?.some((filter: IntentFilter) => {
    const hasMain = filter.action?.some((action: { name: string }) => action.name === INTENT_MAIN);
    if (!hasMain) {
      return false;
    }
    return filter.category?.some((category: { name: string }) => category.name === CATEGORY_LAUNCHER);
  });
};
