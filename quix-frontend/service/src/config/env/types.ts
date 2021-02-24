import {envSettingsDefaults} from './static-settings';
import {ComponentConfiguration} from '@wix/quix-shared';

export type StaticSettings = typeof envSettingsDefaults;
export interface ComputedSettings {
  moduleSettings: Record<
    string,
    {
      syntax: string;
      engine: string;
      components: ComponentConfiguration;
    }
  >;
}

export type EnvSettings = StaticSettings & ComputedSettings;
