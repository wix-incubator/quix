import {IStateProvider} from './types';
import {injector} from '../injector';

export const urlStateProvider: IStateProvider = new class UrlStateProvider implements IStateProvider {
  private location: ng.ILocationService;

  constructor() {
    injector.on('ready', () => {
      this.location = injector.get('$location');
    });
  }

  getStateData(stateName: string): string {
    const urlMap = this.location.search();
    const result = urlMap[stateName + '-data'];
    return result ? result : null;
  }

  setStateData(stateName: string, data: string): void {
    //-- Nothing for now. maybe change url --
  }
};
