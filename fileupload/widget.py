import base64
import ipywidgets
import traitlets


class FileUploadWidget(ipywidgets.DOMWidget):
    '''File Upload Widget.
    This widget provides file upload using `FileReader`.
    '''
    _view_name = traitlets.Unicode('FileUploadView').tag(sync=True)
    _view_module = traitlets.Unicode('fileupload').tag(sync=True)

    label = traitlets.Unicode(help='Label on button.').tag(sync=True)
    filename = traitlets.Unicode(help='Filename of `data`.').tag(sync=True)
    
    data_chunk = traitlets.Unicode(help='File chunk, base64 encoded.').tag(sync=True)
    data_decoded = traitlets.Bytes(help='File content, partial')
    data = traitlets.Bytes(help='File content.')

    data_ready = traitlets.Bool(help='File uploaded.').tag(sync=True)

    count = traitlets.Int(help='Number of chunks').tag(sync=True)
    progress = traitlets.Unicode(help='Progress of upload process.').tag(sync=True)

    def __init__(self, label="Browse", *args, **kwargs):
        super(FileUploadWidget, self).__init__(*args, **kwargs)
        self._dom_classes += ('widget_item', 'btn-group')
        self.label = label
        self.count = 0

    def _data_chunk_changed(self, *args):
        self.data_decoded += base64.b64decode(self.data_chunk.split(',', 1)[1])
        self.count = self.count + 1
        
    def _data_ready_changed(self, *args):
        self.progress = "100"
        self.data = self.data_decoded

