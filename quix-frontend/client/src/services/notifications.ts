import {injector} from '../lib/core/srv/injector';
import {isFunction} from 'lodash';

interface INotificationTemplate {
  name: string;
  icon: string;
  title: string;
  body: ((...args: any[]) => string) | string;
  onlyWhenHidden: boolean;
  onClick?(window: Window): void;
}


class BrowserNotificationsManager {
  private $window: ng.IWindowService;
  private readonly Notification = Notification;
  private readonly templates: Record<string, INotificationTemplate> = {};

  constructor() {
    if (this.Notification && this.Notification.permission === 'default') {
      this.Notification.requestPermission();
    }
    
    injector.on('ready', () => {
      this.$window = injector.get('$window');
    });
  }

  private _fixUrl(url: string) {
    return this.$window.quixConfig.staticsBaseUrl + url;
  }

  register(template: INotificationTemplate) {
    this.templates[template.name] = template;
  }

  notify(templateName: string, ...args: any[]) {
    const template = this.templates[templateName];
    if (!this.Notification || !template) {
      return;
    }

    let body: string;
    if (!template.onlyWhenHidden || this.$window.document.hidden) {
      if (isFunction(template.body)) {
        body = template.body(...args);
      } else {
        body = template.body;
      }
      const notification = new this.Notification(template.title, {body, icon: this._fixUrl(template.icon)});
      if (template.onClick) {
        notification.onclick = template.onClick.bind(notification, this.$window);
      }
    }
  }

}

export const browserNotificationsManager = new BrowserNotificationsManager();
