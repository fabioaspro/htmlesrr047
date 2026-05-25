import { Injectable } from '@angular/core';

@Injectable()
export class MenuDatasulService {

  constructor() {}

  public callProgress(program: any) {

    /**
     * var program = {};
     * program['prg'] = "ut-cons";
     * var params = [{ "type": "character", "value": "cd0110"}];
     * program['params'] = params;
     */

     parent.postMessage({program: program},"*");
  }

  public sendNotification(notification: any) {

    /**
     * var notification = {};
     * notification['type'] = 'success';
     * notification['title'] = 'Notification Title'
     * notification['detail'] = 'Notification Detail'
     */

     parent.postMessage({notification: notification},"*");
  }
}
