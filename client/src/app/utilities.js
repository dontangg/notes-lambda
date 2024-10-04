
export const convertMsToStr = (ms) => {
	if (!ms) return '00:00';
	return new Date(ms * 1000).toISOString().substring(14, 19);
};
