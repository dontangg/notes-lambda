
export const convertMsToStr = (ms) => {
	if (!ms) return '00:00';
	return new Date(ms * 1000).toISOString().substring(14, 19);
};

export const uploadFile = (file, uploadUrl, onProgress) => {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener("progress", (e) => {
			if (e.lengthComputable && typeof onProgress === 'function') {
				const percentage = Math.round((e.loaded * 100) / e.total);
				onProgress(percentage);
			}
		});

		xhr.upload.addEventListener("load", resolve);
		xhr.upload.addEventListener("error", reject);

		xhr.open("PUT", uploadUrl);
		xhr.setRequestHeader('Content-Type', file.type);

		xhr.send(file);
	});
};
