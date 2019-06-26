import {throttle} from 'lodash';
import {initNgScope, inject} from '../../../core';
import {BufferedCollection} from '../../../core/srv/collections';

const shouldFetchMore = element => {
  const viewportHeight = element.height();
  const contentHeight = element.get(0).scrollHeight;
  const topOffset = element.scrollTop();

  return contentHeight - topOffset - viewportHeight < 40;
}

const sync = (scope, collection: BufferedCollection) => {
  inject('$timeout')(() => scope.bisBuffer = collection.models.map(({data}) => data));
}

const getScrollhandler = (scope, element) => throttle(() => {
  const {collection} = scope.vm;

  if (collection && collection.hasMore() && shouldFetchMore(element)) {
    collection.more();
    sync(scope, collection);
  }

  return true;
}, 500);

export default () => {
  return {
    restrict: 'A',
    scope: {
      biInfiniteScroll: '<',
      bisOptions: '<',
      bisBuffer: '=',
    },

    link(scope, element) {
      initNgScope(scope)
        .withOptions('bisOptions', {
          chunkSize: 20
        })
        .withVM({
          collection: null
        });

      element.on('scroll', getScrollhandler(scope, element));

      scope.$watch('biInfiniteScroll', items => {
        if (!items || typeof items.length === 'undefined') {
          return;
        }

        const collection = new BufferedCollection().setChunkSize(scope.options.chunkSize);
        collection.fetch();
        collection.feed(items);

        if (items.length < scope.options.chunkSize) {
          collection.seal();
        }

        scope.vm.collection = collection;

        sync(scope, collection);
      });
    }
  };
};
