import { requireNativeModule } from 'expo';

import type { IsLiveActivityRunningFn, StartLiveActivityFn, StopLiveActivityFn, UpdateLiveActivityFn } from './ActivityController.types';

const nativeModule = requireNativeModule('ActivityController');

export const startLiveActivity: StartLiveActivityFn = async params => {
  const stringParams = JSON.stringify(params);
  return nativeModule.startLiveActivity(stringParams);
};

export const updateLiveActivity: UpdateLiveActivityFn = async params => {
  const stringParams = JSON.stringify(params);
  return nativeModule.updateLiveActivity(stringParams);
};

export const stopLiveActivity: StopLiveActivityFn = () => {
  return nativeModule.stopLiveActivity();
};

export const isLiveActivityRunning: IsLiveActivityRunningFn = () => {
  return nativeModule.isLiveActivityRunning();
};

export const areLiveActivitiesEnabled: boolean = nativeModule.areLiveActivitiesEnabled;
