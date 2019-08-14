import {Reducer, BaseAction, AnyAction} from './common-types';
import {replaceWith} from '../../utils/utils';

const creatingReducer = <T extends {id: string; dateUpdated?: number}, A extends BaseAction = AnyAction>(
  entityName: string,
  entityTransformer = (x: any) => x
): Reducer<T, A> =>
  (state, action_) => {
    const action = action_ as AnyAction;

    switch (action.type) {
      case `${entityName}.create`: {
        if (action[entityName]) {
          const owner = action.user ? {owner: action.user} : {};
          return {...entityTransformer(action[entityName]), ...owner};
        }

        break;
      }
      default:
    }

    return state;
  }

const deletingReducer = <T extends {id: string; dateUpdated?: number}, A extends BaseAction = AnyAction>(
  entityName: string
): Reducer<T, A> =>
  (state, action_) => {
    const action = action_ as AnyAction;

    switch (action.type) {
      case `${entityName}.delete`:
        return state;
      default:
    }

    return state;
  }

const updatingReducer = <T extends {id: string; dateUpdated?: number}, A extends BaseAction = AnyAction>(
  entityName: string
): Reducer<T, A> =>
  (state, action_) => {
    const action = action_ as AnyAction;

    if (action.type.startsWith(`${entityName}.update`) && state && state.id === action.id) {
      const prop = action.type.split('.')[2];

      if (prop && typeof action[prop] !== 'undefined') {
        state.dateUpdated = action.dateCreated || Date.now();
        return {...state as any, [prop]: action[prop]};
      }
    }

    return state;
  }

const listReducer = <T extends {id: string}, A extends BaseAction = AnyAction>(
  entityOrMap: string | Record<string, Reducer<T, A>>,
  reducer: Reducer<T, A> = x => x,
  options: {
    createIfNull: boolean;
    delete: boolean;
  }
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
        state = !state && options.createIfNull ? [] : state;
        return state && [...state, entityReducer(undefined, action) as T];
      case 'delete':
        if (options.delete) {
          return state && state.filter(item => item.id !== action.id);
        }
        break;
      case 'update':
        return state && replaceWith(state, {id: action.id}, item => entityReducer(item, action));
      default:
    }

    return state;
  };

  return fn(s, a);
}

export const composeReducers = <T extends {id: string}, A extends BaseAction = AnyAction>(
  ...args: Reducer<T, A>[]
): Reducer<T, A> => (state, action) => args.reduce((s, reducer) => reducer(s, action), state);

export const createReducer = <T extends {id: string; dateUpdated?: number}, A extends BaseAction = AnyAction>(
  entityName: string,
  entityTransformer = (x: any) => x
): Reducer<T, A> => composeReducers(
  creatingReducer(entityName, entityTransformer),
  deletingReducer(entityName),
  updatingReducer(entityName),
);

export const createClientReducer = <T extends {id: string; dateUpdated?: number}, A extends BaseAction = AnyAction>(
  entityName: string
): Reducer<T, A> => composeReducers(
  updatingReducer(entityName),
);

export const createListReducer = <T extends {id: string}, A extends BaseAction = AnyAction>(
  entityOrMap: string | Record<string, Reducer<T, A>>,
  reducer: Reducer<T, A> = x => x
) => listReducer(entityOrMap, reducer, {createIfNull: true, delete: true});

export const createClientListReducer = <T extends {id: string}, A extends BaseAction = AnyAction>(
  entityOrMap: string | Record<string, Reducer<T, A>>,
  reducer: Reducer<T, A> = x => x,
  options: {
    delete: boolean;
  } = {delete: true}
) => listReducer(entityOrMap, reducer, {createIfNull: false, delete: options.delete});
