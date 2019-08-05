import {IUser} from 'shared';
import {DbUser, dbUserToUser} from './user/user.entity';
import {
  fromNullable,
  getOrElse,
  option,
  some,
  none,
  chain,
  map,
} from 'fp-ts/lib/Option';
import {pipe} from 'fp-ts/lib/pipeable';
import {createEmptyIUser} from 'shared';

interface IMaybeHasOwnerDetails {
  owner: string;
  ownerDetails?: DbUser;
}

export const extractOwnerDetails = ({
  owner: ownerId,
  ownerDetails,
}: IMaybeHasOwnerDetails): IUser => {
  const userDetails: IUser = pipe(
    fromNullable(ownerDetails),
    chain(dbUser => (dbUser.id ? some(dbUser) : none)), // make sure Id is set
    map(dbUser => dbUserToUser(dbUser)),
    getOrElse(() => createEmptyIUser(ownerId)),
  );
  return userDetails;
};
