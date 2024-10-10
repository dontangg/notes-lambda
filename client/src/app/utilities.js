
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

export const timeAgoInWords = (timeStr) => {
	const seconds = Math.floor((new Date() - new Date(timeStr)) / 1000);
	let num = 0;
	let unit = '';
	let modifier = '';
	if (seconds < 60) {
		num = seconds;
		unit = 'second';
		modifier = 'about';
	} else if (seconds < 3600) {
		num = Math.floor(seconds / 60);
		unit = 'minute';
		modifier = 'about';
	} else if (seconds < 86400) {
		num = Math.floor(seconds / 3600);
		unit = 'hour'
		modifier = 'over';
	} else if (seconds < 604800) {
		num = Math.floor(seconds / 86400);
		unit = 'day';
		modifier = 'over';
	} else if (seconds < 31536000) {
		num = Math.floor(seconds / 604800);
		unit = 'week'
		modifier = 'over';
	} else {
		num = Math.floor(seconds / 31536000);
		unit = 'year';
		modifier = 'over';
	}

	return `${modifier} ${num} ${unit}${num === 1 ? '' : 's'} ago`;
};
