import {PipeTransform, Injectable, ArgumentMetadata} from '@nestjs/common';

const isValidAction = (maybeAction: any) => {
  if (
    typeof maybeAction.type !== 'string' &&
    typeof maybeAction.id !== 'string'
  ) {
    throw new Error('Invalid action ' + JSON.stringify(maybeAction));
  }
};

@Injectable()
export class BaseActionValidation implements PipeTransform {
  transform(action: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'query' && metadata.data === 'sessionId') {
      return action;
    }

    if (Array.isArray(action)) {
      action.forEach(isValidAction);
    } else {
      isValidAction(action);
    }
    return action;
  }
}
