import {PipeTransform, Injectable, ArgumentMetadata} from '@nestjs/common';

const isValidAction = (maybeAction: any) => {
  if (
    typeof maybeAction.type !== 'string' &&
    typeof maybeAction.id !== 'string'
  ) {
    throw new Error('Invalid action');
  }
};

@Injectable()
export class BaseActionValidation implements PipeTransform {
  transform(action: any, metadata: ArgumentMetadata) {
    if (Array.isArray(action)) {
      action.forEach(isValidAction);
    } else {
      isValidAction(action);
    }
    return action;
  }
}
