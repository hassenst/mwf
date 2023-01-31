/**
 * @author Jörn Kreutel
 */

import { Application } from '../../lib/js/mwf/mwf.js';
import { mwf, MyApplication } from '../Main.js';
import { entities } from '../Main.js';
//import { GenericCRUDImplLocal } from '../Main.js';

export default class ListviewViewController extends mwf.ViewController {
  constructor() {
    super();
    /*
    this.items = [
      new entities.MediaItem('m1', 'https://placekitten.com/300/200'),
      new entities.MediaItem('m2', 'https://placekitten.com/100/200'),
      new entities.MediaItem('m3', 'https://placekitten.com/400/300'),
    ];*/

    //this.crudops = GenericCRUDImplLocal.newInstance('MediaItem');

    this.addNewMediaItemElement = null;

    console.log('ListviewController()');
  }

  /*
   * for any view: initialise the view
   */
  async oncreate() {
    // TODO: do databinding, set listeners, initialise the view

    //Zuweisen des Plus-Button zum Hinzufügen
    this.addNewMediaItemElement = this.root.querySelector('#addNewMediaItem');

    this.addNewMediaItemElement.onclick = () => {
      //this.createNewItem();
      this.nextView('mediaEditview');
    };
    /**
     * Switch Crud
     */
    this.switchCrudElement = this.root.querySelector('button.mwf-img-refresh');

    this.scopeDisplayElement = this.root.querySelector('#scope');
    this.switchCrudElement.onclick = () => {
      const currentScope = MyApplication.currentCRUDScope;
      const scope = currentScope === 'local' ? 'remote' : 'local';

      //console.log('Scope:' + scope);
      MyApplication.switchCRUD(scope);
      entities.MediaItem.readAll().then((items) => {
        this.initialiseListview(items);
        this.scopeDisplayElement.textContent = scope;
      });
    };

    this.addListener(new mwf.EventMatcher('crud', 'deleted', 'MediaItem'), (event) => {
      this.removeFromListview(event.data);
    });

    this.addListener(new mwf.EventMatcher('crud', 'created', 'MediaItem'), (event) => {
      this.addToListview(event.data);
    });

    this.addListener(new mwf.EventMatcher('crud', 'updated', 'MediaItem'), (event) => {
      this.updateInListview(event.data._id, event.data);
    });

    //Befüllen Sie die Listenansicht mit dem Resultat der readAll() Methode.
    entities.MediaItem.readAll().then((items) => {
      this.initialiseListview(items);
    });

    // call the superclass once creation is done
    super.oncreate();
  }

  //Funktion zum erstellen eines neuen MediaItems, wird von onCreate benutzt
  /*createNewItem() {
    const newItem = new entities.MediaItem('', 'https://placekitten.com/100/100');
    /*newItem.create().then(() => {
      this.addToListview(newItem);
    });
    this.showDialog('mediaItemDialog', {
      item: newItem,
      actionBindings: {
        submitForm: (event) => {
          event.original.preventDefault();
          newItem.create().then(() => {
            //this.addToListview(newItem);
          });
          this.hideDialog();
        },
      },
    });
  }*/
  /*
  bindListItemView(listviewid, itemview, itemobj) {
    // TODO: implement how attributes of itemobj shall be displayed in itemview
    itemview.root.getElementsByTagName('img')[0].src = itemobj.src;
    itemview.root.getElementsByTagName('h2')[0].textContent = itemobj.title;
    itemview.root.getElementsByTagName('h3')[0].textContent = itemobj.addedDateString;
  }*/

  //Aktion bei Auswahl
  onListItemSelected(itemobj, itemviewid) {
    //alert('Element ' + itemobj.title + itemobj._id + ' wurde ausgewählt!');
    this.nextView('mediaReadview', { item: itemobj });
  }

  //Aktion beim Optionsmenü
  onListItemMenuItemSelected(menuitemview, itemobj, listview) {
    super.onListItemMenuItemSelected(menuitemview, itemobj, listview);
  }

  /**
   * Kopiert das ausgewählte MediaItem
   * @param {MediaItem} item
   *
   */
  copyItem(item) {
    //Copy attributes
    const { title, src, description, contentType } = { ...item };
    //create new MediaItem
    const newItem = new entities.MediaItem(title, src, description, contentType);
    //Save in Database and hide dialog
    /*newItem.create().then(() => {
      //this.addToListview(newItem);
      this.hideDialog();
    });*/
    newItem.create().then(() => {
      this.notifyListeners(new mwf.Event('crud', 'created', 'MediaItem', mediaItem._id));
      this.hideDialog();
    });
  }

  confirmDelete(item) {
    this.showDialog('deleteItemDialog', {
      item: item,
      actionBindings: {
        deleteItem: (event) => {
          this.deleteItem(item);
          this.hideDialog();
        },
        abortDelete: (event) => {
          this.hideDialog();
        },
      },
    });
  }
  /**
   * Löscht das ausgewählte MediaItem
   * @param {MediaItem} item
   *
   */
  deleteItem(item) {
    item.delete().then(() => {
      this.removeFromListview(item._id);
    });
  }
  /**
   * Bearbeitet das MediaItem
   * @param {MediaItem} item
   */
  editItem(item) {
    //item.title = item.title + item.title;
    this.showDialog('mediaItemDialog', {
      item: item,
      actionBindings: {
        submitForm: (event) => {
          event.original.preventDefault();
          item.update().then(() => {
            //this.updateInListview(item._id, item);
            this.hideDialog();
          });
        },
        deleteItem: (event) => {
          this.deleteItem(item);
          this.hideDialog();
        },
      },
    });
  }
  /**
   * Bearbeitet das MediaItemFRM
   * @param {MediaItem} item
   */
  editItemFRM(item) {
    //item.title = item.title + item.title;
    this.nextView('mediaEditview', {
      item: item,
    });
  }
  /*
   * for views that initiate transitions to other views
   * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
   */
  /*
  async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
    // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
    if (nextviewid === 'mediaReadview' && returnValue && returnValue.deletedItem) {
      this.removeFromListview(returnValue.deletedItem._id);
    }
  }*/
}
