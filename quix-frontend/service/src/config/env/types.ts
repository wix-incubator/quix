import {envSettingsDefaults} from './static-settings';

export type StaticSettings = typeof envSettingsDefaults;
export interface ComputedSettings {
  moduleSettings: Record<string, {syntax: string; engine: string}>;
}

export type EnvSettings = StaticSettings & ComputedSettings;
