import './state-loader.scss';

let prefix = '';

function getTargetDepth(state1: string, state2: string) {
  let res = 0;
  const prefixLength = prefix ? prefix.split('.').length - 1 : 0;

  if (state1 === state2) {
    return prefixLength || res;
  }

  const s1 = state1.split('.');
  const s2 = state2.split('.');
  const len = Math.min(s1.length, s2.length);

  for (let i = 0; i < len; i++) {
    if (s1[i] === s2[i]) {
      res++;
    } else {
      break;
    }
  }

  return res;
}

export function setPrefix(p: string) {
  prefix = p;
}

export default function() {
  return {
    restrict: 'A',
    scope: {},

    link(scope, element, attrs) {
      scope.$on('$stateChangeStart', function (_, to, __, from) {
        const myDepth = element.parents('[ui-view]').length;
        const targetDepth = getTargetDepth(to.name, from.name);

        if (myDepth === targetDepth) {
          element.addClass('loading-state spinner');
        }
      });

      scope.$on('$stateChangeSuccess', function () {
        element.removeClass('loading-state spinner');
      });
    }
  };
}
