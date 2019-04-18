import PluginInstance from '../services/plugin-instance';

export interface StoryBuilder extends PluginInstance<any> {
  story(folder: string, name: string): any;
}

export type StoryDefiniton = (sb: StoryBuilder) => any;
