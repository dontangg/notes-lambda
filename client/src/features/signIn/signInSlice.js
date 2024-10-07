import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { rawFetch, FetchStatus } from '../../app/appFetch';

const pageLoadAuthToken = window.localStorage.getItem('authToken') || '';
const pageLoadUserStr = window.localStorage.getItem('user'); // {"admin":true,"id":1,"partnerId":16}
let pageLoadUser = null;
if (pageLoadUserStr) {
	try {
		pageLoadUser = JSON.parse(pageLoadUserStr);
	} catch (e) {
		console.error(e);
	}
}

const initialState = {
	authToken: pageLoadAuthToken,
	signInStatus: FetchStatus.idle,
	currentUser: pageLoadUser,
	error: '',
};

export const fetchSignIn = createAsyncThunk(
	'signin/fetchSignIn',
	async (arg, thunkAPI) => {
		const body = arg;
		const email = body.email;

		return rawFetch('/get_token', { method: 'POST', body: JSON.stringify(body) })
			.then(response => {
				if (!response.ok) {
					if (response.status >= 400 && response.status < 500)
						throw new Error('Invalid username and/or password');
					throw new Error('Unable to sign in');
				}
				return response.json();
			}, () => { throw new Error('Unable to sign in'); });

	}, {
		condition: (arg, { getState, extra }) => {
			const signInState = getState().signIn;
			return signInState.signInStatus !== FetchStatus.pending;
		}
	},
);

export const signInSlice = createSlice({
	name: 'signIn',
	initialState,
	reducers: {
		signOut: (state) => {
			state.authToken = '';
			state.signInStatus = FetchStatus.idle;
			window.localStorage.removeItem('authToken');
			window.localStorage.removeItem('user');
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchSignIn.fulfilled, (state, action) => {
			window.localStorage.setItem('authToken', action.payload.token);
			window.localStorage.setItem('user', JSON.stringify(action.payload.user));

			state.error = '';
			state.signInStatus = FetchStatus.success;
			state.authToken = action.payload.token;
			state.currentUser = action.payload.user;
		});
		builder.addCase(fetchSignIn.rejected, (state, action) => {
			state.signInStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(fetchSignIn.pending, (state, action) => {
			state.signInStatus = FetchStatus.pending;
		});
	},
	selectors: {
		selectSignIn: state => state,
		selectCurrentUser: state => state.currentUser,
	},
});

export const { signOut } = signInSlice.actions;

export const { selectSignIn, selectCurrentUser } = signInSlice.selectors;
