import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import appFetch, { FetchStatus } from '../../app/appFetch';

const initialState = {
	accountFetchStatus: FetchStatus.idle,
	saveInfoStatus: FetchStatus.idle,
	savePasswordStatus: FetchStatus.idle,
	name: '',
	email: '',
	error: '',
};

export const fetchCurrentUser = createAsyncThunk(
	'account/fetchCurrentUser',
	async (arg, { dispatch, getState }) => {
		return appFetch('/user', null, dispatch, getState).then(response => response.json());
	}, {
		condition: (arg, { getState, extra }) => {
			const accountState = getState().account;
			return accountState.accountFetchStatus !== FetchStatus.pending;
		}
	},
);

export const savePersonalInfo = createAsyncThunk(
	'account/savePersonalInfo',
	async (arg, { dispatch, getState }) => {
		const body = JSON.stringify(arg);
		return appFetch('/user', { method: 'POST', body }, dispatch, getState).then(() => arg);
	}, {
		condition: (arg, { getState, extra }) => {
			const accountState = getState().account;
			return accountState.saveInfoStatus !== FetchStatus.pending && accountState.savePasswordStatus !== FetchStatus.pending;
		}
	},
);

export const savePassword = createAsyncThunk(
	'account/savePassword',
	async (arg, { dispatch, getState }) => {
		const body = JSON.stringify(arg);
		return appFetch('/user', { method: 'POST', body }, dispatch, getState).then(() => true);
	}, {
		condition: (arg, { getState, extra }) => {
			const accountState = getState().account;
			return accountState.saveInfoStatus !== FetchStatus.pending && accountState.savePasswordStatus !== FetchStatus.pending;
		}
	},
);

export const accountSlice = createSlice({
	name: 'account',
	initialState,
	reducers: {
		changeSignInField: (state, action) => {
			state[action.payload.fieldName] = action.payload.text;
		},
	},
	extraReducers: (builder) => {
		// fetchCurrentUser
		builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
			state.error = '';
			state.accountFetchStatus = FetchStatus.success;
			state.name = action.payload.name;
			state.email = action.payload.email;
		});
		builder.addCase(fetchCurrentUser.rejected, (state, action) => {
			state.accountFetchStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(fetchCurrentUser.pending, (state, action) => {
			state.accountFetchStatus = FetchStatus.pending;
		});
		//savePersonalInfo
		builder.addCase(savePersonalInfo.fulfilled, (state, action) => {
			state.error = '';
			state.saveInfoStatus = FetchStatus.success;
			if (action.payload.name) state.name = action.payload.name;
			if (action.payload.email) state.email = action.payload.email;
		});
		builder.addCase(savePersonalInfo.rejected, (state, action) => {
			state.saveInfoStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(savePersonalInfo.pending, (state, action) => {
			state.saveInfoStatus = FetchStatus.pending;
		});
		//savePassword
		builder.addCase(savePassword.fulfilled, (state, action) => {
			state.error = '';
			state.savePasswordStatus = FetchStatus.success;
		});
		builder.addCase(savePassword.rejected, (state, action) => {
			state.savePasswordStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(savePassword.pending, (state, action) => {
			state.savePasswordStatus = FetchStatus.pending;
		});
	},
	selectors: {
		selectAccount: state => state,
	},
});

export const { selectAccount } = accountSlice.selectors;
