<!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>Uploader</title>
		<link rel="stylesheet" media="screen" href="Assets/Styles/uploader.css" />
	</head>
	
	<body>
		<p>
			Multiple selection/upload<br />
			Automatic uploader<br />
			Image files only<br />
			3 Simultaneous uploads<br />
			Maximum of 10 files queued at once
		</p>
		<div id="uploader"></div>
		<div id="queue"></div>
		<div id="files"></div>
		<p>&nbsp;</p>
		<p>
			1 Image upload<br />
			Manual upload<br />
			File stays visible once completed<br />
			Function fired once upload complete (check console)
		</p>
		<div id="uploader2"></div>
		<div id="queue2"></div>
		<p><a href="javascript: uploader.uploadQueue('uploader2');">Upload Queue</a></p>
		<script src="Assets/Scripts/Standardizer.js"></script>
		<script src="Assets/Scripts/uploader.js"></script>
		<script src="Assets/Scripts/swfobject.js"></script>
		<script>
			uploader.init({
				id: 'uploader',
				uploader: 'Assets/Flash/uploader.swf',
				expressInstall: 'Assets/Flash/expressInstall.swf',
				queueID: 'queue',
				multi: true,
				auto: true,
				fileExt: '*.jpg;*.jpeg;*.png;*.gif',
				fileDesc: 'Image files (JPG, PNG, GIF)',
				buttonImg: "Assets/Images/flash-browse.png",
				scriptData: {t: " hi"},
				width: 75,
				height: 22,
				simUploadLimit: 3,
				queueSizeLimit: 10,
				onComplete: function(id, fileID, fileObj, response) {
					var files = st.utils.getEl('files'),
						para = st.utils.createElement('p');
					
					para.innerHTML = fileObj.name + " " + response;
					files.appendChild(para);
				}
			});
			
			uploader.init({
				id: 'uploader2',
				uploader: 'Assets/Flash/uploader.swf',
				expressInstall: 'Assets/Flash/expressInstall.swf',
				queueID: 'queue2',
				removeCompleted: false,
				buttonImg: "Assets/Images/flash-upload.png",
				width: 75,
				height: 22,
				onComplete: function(id, fileID, fileObj, response) {
					console.log("Uploader '"+id+"' uploaded the file '"+fileObj.name+"' (File ID: '"+fileID+"') and returned the following: '"+response+"'");
				}
			});
		</script>
	</body>
</html>