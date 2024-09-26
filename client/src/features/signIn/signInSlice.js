import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { rawFetch, FetchStatus } from '../../app/appFetch';

const pageLoadAuthToken = window.localStorage.getItem('authToken') || '';

const initialState = {
	authToken: pageLoadAuthToken,
	signInStatus: FetchStatus.idle,
	error: '',
};

export const fetchSignIn = createAsyncThunk(
    'signin/fetchSignIn',
    async (arg, thunkAPI) => {
        const signInState = thunkAPI.getState().signIn;

        const body = arg;

        return rawFetch('/get_token', { method: 'POST', body: JSON.stringify(body) })
			.then(response => {
				if (!response.ok) {
					if (response.status >= 400 && response.status < 500)
						throw new Error('Invalid username and/or password');
					throw new Error('Unable to sign in');
				}
				return response.json().then(jsonResponse => ({ token: jsonResponse.token }));
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
		},
        changeSignInField: (state, action) => {
            state[action.payload.fieldName] = action.payload.text;
        },
	},
    extraReducers: (builder) => {
        builder.addCase(fetchSignIn.fulfilled, (state, action) => {
            window.localStorage.setItem('authToken', action.payload.token);

			state.error = '';
            state.signInStatus = FetchStatus.success;
            state.authToken = action.payload.token;
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
		getSignInState: state => state,
	},
});

export const { signOut } = signInSlice.actions;

export const { getSignInState } = signInSlice.selectors;