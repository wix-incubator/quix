import {Controller, Get, UseGuards, UseInterceptors} from '@nestjs/common';
import {IUser} from 'shared';
import {User} from 'modules/auth';
import {FavoritesService} from './favorites.service';
import {AuthGuard} from '@nestjs/passport';
import {DemoModeInterceptor} from 'common/demo-mode-interceptor';

@Controller('/api/favorites')
@UseInterceptors(DemoModeInterceptor)
export class FavoritesController {
  constructor(private favoritesListService: FavoritesService) {}

  @Get()
  @UseGuards(AuthGuard())
  async getUserFavorites(@User() user: IUser) {
    return this.favoritesListService.getFavoritesForUser(user.email);
  }
}
