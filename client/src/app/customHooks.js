import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
	const fullTitle = `${title} - Notes`;
	if (document.title !== fullTitle) {
		document.title = fullTitle;
	}
  }, [title]);
};