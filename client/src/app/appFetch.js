'use strict';

import { signOut } from '../features/signIn/signInSlice';

const apiUrlPrefix = "https://notesapi.thewilsonpad.com";

export const FetchStatus = {
	idle: 'idle',
	pending: 'pending',
	success: 'success',
	error: 'error',
};

export const rawFetch = (path, options) => {
	const url = apiUrlPrefix + path;
	return fetch(url, options);
};

export default function appFetch(path, options, dispatch, getState) {
	const url = apiUrlPrefix + path;

	const authToken = getState().signIn.authToken;

	if (!options) options = {};
	if (!options.headers) options.headers = {};
	options.headers['Authorization'] = 'Bearer ' + authToken;

	return fetch(url, options).then(response => {
		if (response.status === 401) {
			dispatch(signOut());
			throw "Unauthorized";
		}
		if (!response.ok) { // If the server returned a 400-500, reject the promise
			const defaultMessage = response.status + ' ' + response.statusText;

			// Check for a message in the server response to use as the error message
			return response.json().then(responseBody => {
				if (responseBody.message) {
					throw responseBody.message;
				} else {
					throw defaultMessage;
				}
			}, () => { throw defaultMessage; });
		}
		return response;
	});
};