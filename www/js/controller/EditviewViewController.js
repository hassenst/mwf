/**
 * @author Jörn Kreutel
 */
import { mwf, MyApplication } from '../Main.js';
import { entities } from '../Main.js';

export default class EditviewViewController extends mwf.ViewController {
  constructor() {
    super();

    console.log('EditviewViewController()');
    this.viewProxy = null;
  }

  /*
   * for any view: initialise the view
   */
  async oncreate() {
    // TODO: do databinding, set listeners, initialise the view
    this.mediaItem = this.args?.item || new entities.MediaItem('', '', '', '', ''); //new entities.MediaItem('m', 'https://placekitten.com/300/400');

    //ViewProxy Zuweisung
    this.viewProxy = this.bindElement(
      'editviewviewTemplate',
      { item: this.mediaItem },
      this.root
    ).viewProxy;

    //Form listeners
    this.editForm = this.root.querySelector('#edit');

    //Clone Object
    if (this.mediaItem.created) {
      this.editForm.src.blur();
      this.clone = { ...this.mediaItem };
    }

    //get currentCrudScope
    this.currentCrudScope = MyApplication.currentCRUDScope;
    //get the label
    this.fileLabel = this.root.querySelector('label');

    //Disable Fileupload on local
    if (this.currentCrudScope == 'local') {
      this.fileLabel.classList.toggle('mwf-disabled');
    }

    //Vorschaubild
    this.thumbnail = this.root.querySelector('.preview');

    this.thumbnail.src = this.mediaItem.src;

    //Fileinput listeners
    this.editForm.filesrc.onchange = (event) => {
      const filedata = this.editForm.filesrc.files[0];
      const filedataurl = URL.createObjectURL(filedata);
      //this.thumbnail.src = this.mediaSrc.value =
      this.mediaItem.src = filedataurl;
      this.mediaItem.contentType = filedata.type;
      //console.log('MediaType:', this.mediaItem.mediaType);
      this.viewProxy.update({ item: this.mediaItem });
      const newUrl = this.root.querySelector('.preview');
      newUrl.src = this.mediaItem.src;
      //alert('file selected:' + filedataurl);
    };

    console.log('MediaItemContentTYpe: ', this.mediaItem.mediaType);
    //Setzen des Vorschaubilds, falls vorhanden
    //if (this.mediaItem.mediaType != 'video') this.thumbnail.src = this.mediaItem.src;

    //Eingabefeld für src
    //this.mediaSrc = this.root.querySelector('#mediasrc');

    //Set Media Source to Input Value
    this.editForm.src.onblur = (event) => {
      //this.thumbnail.src =
      console.log('mediaItem.src: ', this.editForm.src.value);

      fetch(this.mediaItem.src, { mode: 'cors' }).then((response) => {
        this.mediaItem.contentType = response.headers.get('content-type');
        console.log('FetchContentTypeHeader:', response.headers);

        console.log('FetchContentType:', this.mediaItem.contentType);
        this.mediaItem.src = this.thumbnail.src = this.editForm.src.value;

        this.viewProxy.update({ item: this.mediaItem });
        console.log('FetchMediaItem:', this.mediaItem);

        const newUrl = this.root.querySelector('.preview');
        newUrl.src = this.mediaItem.src;
        console.log('Mediatype: ', this.mediaItem.mediaType);
        console.log('headerType: ', response.headers.get('content-type'));
      });
    };

    this.viewProxy.bindAction('updateItem', () => {
      this.editForm.onsubmit = (event) => {
        //stop default behaviour
        event.preventDefault();

        //console.log(this.mediaItem);
        //console.log('FormProperties: ', formProps);

        const filedataselected = this.editForm.filesrc.files[0];

        if (filedataselected) {
          const requestBody = new FormData();
          requestBody.append('filesrc', filedataselected);

          const request = new XMLHttpRequest();
          request.open('POST', 'api/upload');
          request.send(requestBody);

          request.onload = () => {
            const requestbodyastext = request.responseText;
            const requestResponseTextAsJson = JSON.parse(requestbodyastext);
            const filesrcurl = requestResponseTextAsJson.data.filesrc;
            this.mediaItem.src = filesrcurl;

            this.createOrUpdateMediaItem(this.mediaItem);

            console.log('response XML:', requestbodyastext);
          };
        } else {
          this.createOrUpdateMediaItem(this.mediaItem);
        }
      };
    });

    //Action für default Imagesrc

    this.viewProxy.bindAction('setDefault', () => {
      this.editForm.src.value = 'https://placekitten.com/200/200';
      this.editForm.src.focus();
    });

    //action für delete Button
    if (this.mediaItem.created)
      this.viewProxy.bindAction('deleteItem', () => {
        this.mediaItem.delete().then(() => {
          this.previousView({ deletedItem: this.mediaItem });
          this.notifyListeners(
            new mwf.Event('crud', 'deleted', 'MediaItem', this.mediaItem._id)
          );
        });
      });

    // call the superclass once creation is done
    super.oncreate();
  }

  //Resets the Form without saving changes an return to previous view
  async onback() {
    //console.log('MediaItemBack: ', this.mediaItem);
    //console.log('CloneDataBack: ', this.clone);
    this.editForm.reset();
    if (this.clone) {
      this.mediaItem = this.clone;
      this.viewProxy.update(this.mediaItem);

      console.log('MediaItemBack: ', this.mediaItem);
    }
    this.previousView();
  }

  async onpause() {
    const video = this.root.querySelector('video');
    if (video) {
      video.pause();
    }

    super.onpause();
  }

  createOrUpdateMediaItem(item) {
    if (!item.created) {
      //Das MediaItem erstellen
      item.create().then(() => {
        this.notifyListeners(new mwf.Event('crud', 'created', 'MediaItem', item._id));
        this.previousView({ item: item });
      });
    } else {
      //sonst MediaItem updaten
      item.update().then(() => {
        this.notifyListeners(new mwf.Event('crud', 'updated', 'MediaItem', item._id));
        this.previousView({ item: item });
      });
    }
  }

  /*
   * for views with listviews: bind a list item to an item view
   * TODO: delete if no listview is used or if databinding uses ractive templates
   
  bindListItemView(listviewid, itemview, itemobj) {
    // TODO: implement how attributes of itemobj shall be displayed in itemview
  }*/

  /*
   * for views with listviews: react to the selection of a listitem
   * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
   
  onListItemSelected(itemobj, listviewid) {
    // TODO: implement how selection of itemobj shall be handled
  }*/

  /*
   * for views with listviews: react to the selection of a listitem menu option
   * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
   
  onListItemMenuItemSelected(menuitemview, itemobj, listview) {
    // TODO: implement how selection of the option menuitemview for itemobj shall be handled
  }*/

  /*
   * for views with dialogs
   * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
   
  bindDialog(dialogid, dialogview, dialogdataobj) {
    // call the supertype function
    //super.bindDialog(dialogid, dialogview, dialogdataobj);
    // TODO: implement action bindings for dialog, accessing dialog.root
  }*/

  /*
   * for views that initiate transitions to other views
   * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
   
  async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
    // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
  }*/
}
