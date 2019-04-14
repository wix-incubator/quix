export interface IStateClient {
  name: string;
  importFunc(params: any): void;
  exportFunc(providerName: string, stateName: string): Object;
}

export interface IStateProvider {
  getStateData(stateName: string): string;
  setStateData(stateName: string, data: string): void;
}
