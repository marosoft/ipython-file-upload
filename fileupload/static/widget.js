define([
    'jquery',
    'jupyter-js-widgets'
], function ($, widgets) {

    'use strict';
    var _getId = (function () {

            var cnt = 0;
            return function () {

                cnt += 1;
                return 'fileupload_' + cnt;
            }
    })();

    var parseFile = function(file, chunkSize, callback, callbackComplete) {
        var fileSize   = file.size;
        var offset     = 0;
        var self       = this; // we need a reference to the current object
        var chunkReaderBlock = null;
    
        var readEventHandler = function(evt) {

            offset += chunkSize;

            if (evt.target.error == null) {
                console.log("Chunk: ", chunkSize, evt.target.result.length);
                callback(evt.target.result); // callback for handling read chunk
            } else {
                console.log("Read error: " + evt.target.error);
                return;
            }

            if (offset >= fileSize) {
                console.log("Done reading file");
                callbackComplete();
                return;
            }
    
            // of to the next chunk
            window.setTimeout(() => chunkReaderBlock(offset, chunkSize, file), 250);
        }
    
        chunkReaderBlock = function(_offset, length, _file) {
            var r = new FileReader();
            var blob = _file.slice(_offset, length + _offset);
            r.onload = readEventHandler;
            r.readAsDataURL(blob);
        }
    
        // now let's start the read with the first block
        chunkReaderBlock(offset, chunkSize, file);
    };

    var waitfor = function(test, expectedValue, msec, count, source, callback) {
        // Check if condition met. If not, re-check later (msec).
        while (test() !== expectedValue) {
            count++;
            console.log(source + ': ' + test() + ', expected: ' + expectedValue + ', ' + count + ' loops.');
            setTimeout(function() {
                waitfor(test, expectedValue, msec, count, source, callback);
            }, msec);
            return;
        }
        // Condition finally met. callback() can be executed.
        window.setTimeout(() => callback(), 500);
    };

    var FileUploadView = widgets.DOMWidgetView.extend({

        render: function render () {

            FileUploadView.__super__.render.apply(this, arguments);
            var id = _getId();
            var label = this.model.get('label');
            this.model.on('change:label', this._handleLabelChange, this);
            var $label = $('<label />')
            .text(label)
            .addClass('btn btn-default')
            .attr('for', id)
            .appendTo(this.$el);

            $('<input />')
            .attr('type', 'file')
            .attr('id', id)
            .css('display', 'none')
            .appendTo($label);
        },

        _handleLabelChange: function() {
            var label = this.model.get('label');
            this.$el.children("label").contents().first().replaceWith(label);
        },

        events: {
            'change': '_handleFileChange'
        },
        _handleFileChange: function _handleFileChange (ev) {

            var file = ev.target.files[0];
            var that = this;
            var chunks = 0;
            var progress = 0;
            var chunkSize  = 1000 * 1024; // bytes
            var totalChunks = Math.ceil(file.size/chunkSize);

            if (file) {
                var a = parseFile(file, chunkSize, (data) => {
                    console.log("Sending a chunk");
                    chunks++;
                    that.model.set('progress', ((chunks/totalChunks)*100).toFixed(0) );
                    that.model.set('data_chunk', data);
                    that.touch(); 
                }, () => {
                    waitfor( () => {
                            return that.model.get('count');
                        }, chunks, 500, 0, '', () => {
                            console.log("Full data sent");
                            that.model.set('data_ready', true);
                            that.touch();
                        }
                    )  
                });
            }
            else {
                that.send({ event: 'Unable to open file.' });
            }
            that.model.set('filename', file.name);
            that.touch();
        }
    });

    return { FileUploadView: FileUploadView };
});
