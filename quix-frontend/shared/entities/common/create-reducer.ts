import {Reducer, BaseAction, DefaultAction} from './common-types';
import {replaceWith} from '../../utils/utils';

export const composeReducers = <T extends {id: string}, A extends BaseAction = DefaultAction>(
  ...args: Reducer<T, A>[]
): Reducer<T, A> => (state, action) => args.reduce((s, reducer) => reducer(s, action), state);

export const createReducer = <T extends {id: string; dateUpdated?: number}, A extends BaseAction = DefaultAction>(
  entityName: string,
  entityTransformer = (x: any) => x
): Reducer<T, A> =>
  (state, action_) => {
  const action = action_ as DefaultAction;

  switch (action.type) {
    case `${entityName}.create`: {
      if (!state && action[entityName]) {
        const owner = action.user ? {owner: action.user} : {};
        return {...entityTransformer(action[entityName]), ...owner};
      }
      break;
    }
    case `${entityName}.delete`:
      return state;
    default:
  }

  if (action.type.startsWith(`${entityName}.update`) && state && state.id === action.id) {
    const prop = action.type.split('.')[2];

    if (prop && typeof action[prop] !== 'undefined') {
      state.dateUpdated = action.dateCreated || Date.now();
      return {...state as any, [prop]: action[prop]};
    }
  }

  return state;
}

export const createListReducer = <T extends {id: string}, A extends BaseAction = DefaultAction>(
  entityOrMap: string | Record<string, Reducer<T, A>>,
  reducer: Reducer<T, A> = x => x
) => (s: T[], a: A) => {
  const entityMap = typeof entityOrMap === 'string' ? {[entityOrMap]: reducer} : entityOrMap;
  
  const fn = (state: T[], action: A) => {
    const [entityName, actionType] = action.type.split('.');
    const entityReducer = entityMap[entityName];

    if (!entityReducer) {
      return state;
    }

    switch (actionType) {
      case 'create':
        return [...(state || []), entityReducer(undefined, action) as T];
      case 'delete':
      return state && state.filter(item => item.id !== action.id);
      case 'update':
        return state && [...replaceWith(state, {id: action.id}, item => entityReducer(item, action))];
      default:
    }

    return state;
  };

  return fn(s, a);
}
