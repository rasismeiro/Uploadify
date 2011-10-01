var uploader = (function() {
	
	var __uploader = {
		/**
		 * Contains the settings for every created uploader.
		 */
		uploaders: [],
		
		/**
		 * Following method creates a new uploader with the specified settings.
		 * 
		 * @param options { Object } the object containing the settings for the uploader.
		 * @return undefined { }
		 */
		init: function(options) {
			if(typeof(options) == 'undefined') {
				throw('Uploader: You must pass through some settings');	
			}
			
			// Merge the new with the default settings.
			var settings = {
					id: options.id || '',
					uploader: options.uploader || 'uploader.swf',
					script: options.script || 'uploader.php',
					folder: options.folder || 'uploads',
					expressInstall: options.expressInstall || 'expressinstall.swf',
					cancelImg: options.cancelImg || 'cancel.png',
					buttonText: options.buttonText || '',
					buttonImg: options.buttonImg || '',
					width: options.width || 120,
					height: options.height || 20,
					multi: options.multi || false,
					auto: options.auto || false,
					fileExt: options.fileExt || '*.*',
					fileDesc: options.fileDesc || 'All files',
					queueID: options.queueID || '',
					scriptData: options.scriptData || '',
					queueSizeLimit: options.queueSizeLimit || 1,
					simUploadLimit: options.simUploadLimit || 1,
					removeCompleted: options.removeCompleted || true,
					fileDataName: options.fileDataName || 'Filedata',
					onComplete: options.onComplete || function(id, fileID, fileObj, response) { return true; }
				},
				data = {},
				pagePath = location.pathname;
			
			if(options.removeCompleted===false) {
				settings.removeCompleted = false;
			}
			
			// If no uploader id was passed through, warn the user.
			if(settings.uploaderID == '') {
				throw("Uploader: No ID present");
			}
			
			// Store the settings for this uploader.
			__uploader.uploaders[settings.id] = settings;
			
			// Get the root location of the script.
			pagePath = pagePath.split('/');
			pagePath.pop();
			pagePath = pagePath.join('/') + '/';
			
			// Set the FlashVars that will be passed through to the
			// flash file.
			data.pagepath = pagePath;
			data.uploaderID = settings.id;
			data.script = settings.script;
			data.method = 'post';

			if (settings.scriptData != '') {
				var scriptDataString = '';
				for (var name in settings.scriptData) {
					scriptDataString += '&' + name + '=' + settings.scriptData[name];
				}
				data.scriptData = escape(scriptDataString.substr(1));
			}
				
			data.folder = settings.folder;
			data.fileDataName = settings.fileDataName;
			
			if (settings.buttonImg!='') {
				data.buttonImg = escape(settings.buttonImg);
			}
			
			if (settings.buttonText!='') {
				data.buttonText = escape(settings.buttonText);
			}
			
			data.queueSizeLimit = settings.queueSizeLimit;
			data.simUploadLimit = settings.simUploadLimit;
			data.fileDesc = settings.fileDesc;
			data.fileExt = settings.fileExt;
			if(settings.multi) {
				data.multi = settings.multi;
			}
			
			if(settings.auto) {
				data.auto = settings.auto;
			}
			
			// Replace the element passed through with the new flash uploader.
			var currentElement = st.utils.getEl(settings.id),
				newElement = st.utils.createElement('div');
			
			newElement.id = settings.id+'Uploader';
			currentElement.style.display = 'none';
			st.utils.insertAfter(newElement, currentElement);
						
			swfobject.embedSWF(settings.uploader, settings.id + 'Uploader', settings.width, settings.height, '9.0.24', settings.expressInstall, data, {'quality':'high','wmode':'opaque','allowScriptAccess':'sameDomain'}, {}, function(event) {
				
			});
		},
		
		/**
		 * Following method handles the interation between the
		 * flash file and the JavaScript.
		 * 
		 * @param id { String } the string containing the ID of the uploader.
		 * @param info { Object } the object containing the details of the interaction.
		 * @return undefined { }
		 */
		interact: function(id, info) {
			var data = JSON.parse(info),
				settings = __uploader.uploaders[id],
				action = data[0],
				info = data[1];
				
			// Uncomment below if you need to check to see the data being passed
			// from the flash file to the here.
			//console.log(data[0], data[1]);
			
			// Call the relevant function based from the action returned
			// from the flash file.
			switch(action) {
				case 'uploaderSelectOnce':
					if(settings.auto) {
						__uploader.startUpload(id);
					}
					break;
				case 'uploaderSelect':
					__uploader.uploaderSelect(id, info[0], info[1]);
					break;
				case 'uploaderCancel':
					__uploader.uploaderCancel(id, info[0]);
					break;
				case 'uploaderProgress':
					__uploader.uploaderProgress(id, info[0], info[2]);
					break;	
				case 'uploaderComplete':
					__uploader.uploaderComplete(id, info[0], info[1], info[2]);
					break;
				case 'uploaderError':
					__uploader.uploaderError(id, info[0], info[1], info[2]);
					break;
				case 'uploaderQueueFull':
					__uploader.uploaderQueueFull(info);
					break;
			}
		},
		
		/**
		 * Following method handles the selection of files
		 * adding them to the DOM in a file queue.
		 * 
		 * @param id { String } the string containing the ID of the uploader.
		 * @param fileID { String } the id of the related file.
		 * @param fileObj { Object } the object containing the details of the file.
		 * @return undefined { }
		 */
		uploaderSelect: function(id, fileID, fileObj) {
			var byteSize = Math.round(fileObj.size / 1024 * 100) * .01,
				suffix = 'KB',
				sizeParts = [],
				fileName = '',
				settings = __uploader.uploaders[id],
				queue = st.utils.getEl(settings.queueID),
				queueItem = st.utils.createElement('div');
				
			// Create the file size display
			// This can all be removed if we don't want to
			// display this information.
			if (byteSize > 1000) {
				byteSize = Math.round(byteSize *.001 * 100) * .01;
				suffix = 'MB';
			}
			
			sizeParts = byteSize.toString().split('.');
			if (sizeParts.length > 1) {
				byteSize = sizeParts[0] + '.' + sizeParts[1].substr(0,2);
			} else {
				byteSize = sizeParts[0];
			}
			
			// Restrict the file size name to no more than 23 characters.
			if (fileObj.name.length > 20) {
				fileName = fileObj.name.substr(0,20) + '...';
			} else {
				fileName = fileObj.name;
			}
			
			// Give the queue item an id based from the uploader ID and the file ID.
			queueItem.id = id+fileID;
			st.css.addClass(queueItem, 'ui-uploader');
			
			queueItem.innerHTML = '<div class="ui-uploader-cancel">\
				<a href="javascript:uploader.cancel(\''+id+'\', \''+fileID+'\');"><img src="Assets/Images/' + settings.cancelImg + '" border="0" /></a>\
			</div>\
			<span class="ui-uploader-filename">\
			' + fileName + ' (' + byteSize + suffix + ')\
			</span>\
			<div class="ui-uploader-progress">\
				<div id="' + id+fileID + 'ProgressBar" class="ui-uploader-progressbar"><!--Progress Bar--></div>\
			</div>';
			
			queue.appendChild(queueItem);
		},
		
		/**
		 * Following method handles the uploading of a queue
		 * this is usually fired by a link in the HTML.
		 * 
		 * @param id { String/Object } the string/object containing the ID(s) of the uploader.
		 * @return undefined { }
		 */
		uploadQueue: function(id) {
			if(typeof(id)=='object') {
				var len = id.length;
				
				while(len--) {
					__uploader.uploadQueue(id[len]);	
				}
				return;
			}
			__uploader.startUpload(id);
		},
		
		/**
		 * Following method informs the user that they've attempted to queue
		 * more items than they're allowed.
		 * 
		 * @param id { Int } the amount that they're allowed to upload.
		 * @return undefined { }
		 */
		uploaderQueueFull: function(amt) {
			alert('The queue limit for this uploader has been reached. A maximum of '+amt+' file(s) may be queued at any one time.');
		},
		
		/**
		 * Following method handles what happens when an upload completes.
		 * 
		 * @param id { String } the string containing the ID of the uploader.
		 * @param fileID { String } the id of the related file.
		 * @param fileObj { Object } the object containing the details of the file.
		 * @param response { String } the response from the server after uploading.
		 * @return undefined { }
		 */
		uploaderComplete: function(id, fileID, fileObj, response) {
			var settings = __uploader.uploaders[id],
				queueItem = st.utils.getEl(id+fileID);
			
			response = unescape(response);
			if(settings.onComplete.call(settings.onComplete, id, fileID, fileObj, response)===false) {
				return;	
			}

			if (settings.removeCompleted) {
				queueItem.parentNode.removeChild(queueItem);
			}
			st.css.addClass(queueItem, 'ui-uploader-completed');
		},
		
		/**
		 * Following method handles the upload progress of each upload.
		 * 
		 * @param id { String } the string containing the ID of the uploader.
		 * @param fileID { String } the id of the related file.
		 * @param data { Object } the object containing the details of the file progress.
		 * @return undefined { }
		 */
		uploaderProgress: function(id, fileID, data) {
			var progressBar = st.utils.getEl(id+fileID+'ProgressBar');
			progressBar.style.width = data.percentage + '%';
		},
		
		/**
		 * Following method handles what happens when an upload is cancelled.
		 * 
		 * @param id { String } the string containing the ID of the uploader.
		 * @param fileID { String } the id of the related file.
		 * @return undefined { }
		 */
		uploaderCancel: function(id, fileID) {
			var queueItem = st.utils.getEl(id+fileID);
			queueItem.parentNode.removeChild(queueItem);
		},
		
		/**
		 * Following method starts a file upload.
		 * 
		 * @param id { String } the string containing the ID of the uploader.
		 * @return undefined { }
		 */
		startUpload: function(id) {
			var flashUploadObject = st.utils.getEl(id+'Uploader');
			flashUploadObject.startFileUpload(null, true);
		},
		
		/**
		 * Following method cancels a file upload.
		 * 
		 * @param id { String } the string containing the ID of the uploader.
		 * @param fileID { String } the id of the related file.
		 * @return undefined { }
		 */
		cancelUpload: function(id, fileID) {
			var flashUploadObject = st.utils.getEl(id+'Uploader');
			flashUploadObject.cancelFileUpload(fileID, true, true, false);
		},
		
		/**
		 * Following method handles any errors with file transfers.
		 * 
		 * @param id { String } the string containing the ID of the uploader.
		 * @param fileID { String } the id of the related file.
		 * @param fileObj { Object } the object containing the details of the file.
		 * @param errObj { Object } the object containing the details of the error.
		 * @return undefined { }
		 */
		uploaderError: function(id, fileID, fileObj, errObj) {
			var queueItem = st.utils.getEl(id+fileID),
				progressBar = st.utils.getEl(id+fileID+'ProgressBar'),
				parent = progressBar.parentNode;
				
			parent.innerHTML = errObj.type+": "+errObj.info;
			st.css.addClass(parent, 'ui-uploader-errorinfo');
			st.css.addClass(queueItem, 'ui-uploader-error');
		}
	};
	
	return {
		init: __uploader.init,
		interact: __uploader.interact,
		cancel: __uploader.cancelUpload,
		uploadQueue: __uploader.uploadQueue
	}
	
}());