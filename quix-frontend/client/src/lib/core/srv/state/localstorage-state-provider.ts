import {LocalStorage} from '../local-storage';
import {IStateProvider} from './types';

export const localStorageStateProvider: IStateProvider =
  new class LocalStorageStateProvider implements IStateProvider {
    private readonly storage = new LocalStorage();

    getStateData(stateName: string): string {
      return this.storage.getItem(stateName);
    }

    setStateData(stateName: string, data: string): void {
      this.storage.setItem(stateName, data);
    }
  };
