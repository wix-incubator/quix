import * as angular from 'angular';
import {StoryDefiniton} from './story-builder';

declare global {
  interface Window {
    angular: angular.IAngularStatic;
    $: JQueryStatic;
    jQuery: JQueryStatic;
  }
  var biStorybook: {
    create(stories: StoryDefiniton | StoryDefiniton[], moduleDependencies: string[]): any;
  }
}