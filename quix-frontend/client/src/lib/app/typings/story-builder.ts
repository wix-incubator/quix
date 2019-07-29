import {PluginBuilder} from '../services/plugin-builder';

export interface StoryBuilder extends PluginBuilder<any> {
  story(folder: string, name: string): any;
}

export type StoryDefiniton = (sb: StoryBuilder) => any;
