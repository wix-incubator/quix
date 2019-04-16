import {createReducer, createListReducer} from './create-reducer';

interface SomeRandomEntity {
  id: string;
  name: string;
  description: string;
  someNestedObject: {
    foo: number;
  }
}

describe('createBaseReducer', () => {

  const entity: SomeRandomEntity = {
    id: '1',
    name: 'someName',
    description: 'words go here',
    someNestedObject: {
      foo: 10
    }
  }

  it('should handle create actions', () => {
    const reducer = createReducer<SomeRandomEntity>('someEntity')
    const action = {
      type: 'someEntity.create',
      someEntity: entity,
      id: '1'
    }
    const newState = reducer(undefined, action);

    expect(newState).toEqual(entity);
    expect(newState).not.toBe(entity);
  });

  it('should handle delete actions', () => {
    const reducer = createReducer<SomeRandomEntity>('someEntity')
    const action = {
      type: 'someEntity.delete',
      id: '1'
    }
    const newState = reducer(entity, action);
    expect(newState).toBe(entity);
  });

  it('should handle update actions', () => {
    const reducer = createReducer<SomeRandomEntity>('someEntity')
    const action = {
      type: 'someEntity.update.name',
      name: 'newName',
      id: '1'

    }
    const newState = reducer(entity, action);
    expect(newState).toBeDefined;
    expect(newState!.name).toEqual('newName');
  });

  it('should handle update actions of deep properties', () => {
    const reducer = createReducer<SomeRandomEntity>('someEntity')
    const action = {
      type: 'someEntity.update.someNestedObject',
      id: '1',
      someNestedObject: {
        foo: 11
      }
    }
    const newState = reducer(entity, action);
    expect(newState).toBeDefined;
    expect(newState!.someNestedObject).toEqual({foo: 11});
  });

  it('should do nothing on unsupported action', () => {
    const reducer = createReducer<SomeRandomEntity>('someEntity')
    const action = {
      type: 'someEntity.someNestedObject.update.foo',
      foo: 11,
      id: '1'
    }
    const newState = reducer(entity, action);
    expect(newState).toBe(entity);
  });
});


describe('createListReducer', () => {
  const entity: SomeRandomEntity = {
    id: '1',
    name: 'someName',
    description: 'words go here',
    someNestedObject: {
      foo: 10
    }
  }
  let state: SomeRandomEntity[] = [];
  const baseReducer = createReducer<SomeRandomEntity>('someEntity')

  beforeEach(() => state = []);

  it('should add item to list', () => {
    const listReducer = createListReducer('someEntity', baseReducer);
    const action = {
      type: 'someEntity.create',
      someEntity: entity,
      id: entity.id
    };

    const newState = listReducer(state, action);
    expect(newState).toEqual([entity]);
  });

  it('should remove item from list', () => {
    const listReducer = createListReducer('someEntity', baseReducer);
    const action = {
      type: 'someEntity.delete',
      id: entity.id
    };
    
    const newState = listReducer([entity], action);
    expect(newState).toEqual([]);
  });

  it('should handle updates', () => {
    const listReducer = createListReducer('someEntity', baseReducer);
    const action = {
      type: 'someEntity.update.description',
      id: entity.id,
      description: 'newDescription'
    };
    
    const newState = listReducer([entity], action);
    expect(newState).toMatchObject([{...entity, description: 'newDescription'}])
  });

});
