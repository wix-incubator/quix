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
  private staticsBaseUrl: string;
  private readonly Notification = typeof Notification === 'undefined' ? null : Notification;
  private readonly templates: Record<string, INotificationTemplate> = {};

  constructor() {
    if (this.Notification && this.Notification.permission === 'default') {
      this.Notification.requestPermission();
    }
  }

  private fixUrl(url: string) {
    return `${this.staticsBaseUrl}${url}`;
  }

  setStaticsBaseUrl(staticsBaseUrl: string) {
    this.staticsBaseUrl = staticsBaseUrl;
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
    if (!template.onlyWhenHidden || window.document.hidden) {
      if (isFunction(template.body)) {
        body = template.body(...args);
      } else {
        body = template.body;
      }
      const notification = new this.Notification(template.title, {body, icon: this.fixUrl(template.icon)});
      if (template.onClick) {
        notification.onclick = template.onClick.bind(notification, window);
      }
    }
  }

}

export const browserNotificationsManager = new BrowserNotificationsManager();
