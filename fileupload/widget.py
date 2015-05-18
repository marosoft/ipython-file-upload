import os
from IPython.html import widgets, install_nbextension
from IPython.utils import traitlets


class FileUploadWidget(widgets.DOMWidget):
    '''File Upload Widget.
    This widget provides file upload using `FileReader`.
    '''
    module_name = os.path.splitext(os.path.basename(__file__))[0]
    packet_name = os.path.basename(os.path.dirname(__file__))
    _view_static = os.path.abspath(
        os.path.join(os.path.dirname(__file__), 'static', packet_name))

    _view_name = traitlets.Unicode('FileUploadView', sync=True)
    _view_module = traitlets.Unicode(
        os.path.join('nbextensions', packet_name, module_name),
        sync=True)

    data = traitlets.Unicode(help='File content, base64 encoded.', sync=True)
    filename = traitlets.Unicode(help='Filename of `data`.', sync=True)

    def __init__(self, *args, **kwargs):
        install_nbextension(self._view_static, verbose=0)
        super().__init__(*args, **kwargs)