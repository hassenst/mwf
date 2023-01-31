/**
 * @author Jörn Kreutel
 *
 * this skript defines the data types used by the application and the model operations for handling instances of the latter
 */

import { mwfUtils } from '../Main.js';
import { EntityManager } from '../Main.js';

/*************
 * example entity
 *************/
/*
export class MyEntity extends EntityManager.Entity {
  constructor() {
    super();
  }
}*/

export class MediaItem extends EntityManager.Entity {
  constructor(title, src, description, contentType) {
    super();
    this.title = title;
    this.src = src;
    this.srcType = null;
    this.contentType = contentType;
    this.added = Date.now();
    this.description = description;
  }
  /**
   * Getter für das Datum
   */
  get addedDateString() {
    return new Date(this.added).toLocaleDateString();
  }

  /**
   * Getter für den MediaType
   */
  get mediaType() {
    if (this.contentType) {
      let index = this.contentType.indexOf('/');
      if (index > -1) {
        return this.contentType.substring(0, index);
      } else {
        return 'UNKNOWN';
      }
    } else {
      return 'UNKNOWN';
    }
  }
}

// TODO-REPEATED: add new entity type declarations here
