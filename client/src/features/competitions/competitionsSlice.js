import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import appFetch, { FetchStatus } from '../../app/appFetch';

const initialState = {
	competitionsFetchStatus: FetchStatus.idle,
	competitions: null,
};

export const fetchCompetitions = createAsyncThunk(
	'competitions/fetchCompetitions',
	async (arg, { dispatch, getState }) => {
		return appFetch('/competitions', null, dispatch, getState).then(response => response.json());
	}, {
		condition: (arg, { getState, extra }) => {
			const competitionsState = getState().competitions;
			return competitionsState.competitionsFetchStatus !== FetchStatus.pending;
		}
	},
);

export const competitionsSlice = createSlice({
	name: 'competitions',
	initialState,
	reducers: {
		changeSignInField: (state, action) => {
			state[action.payload.fieldName] = action.payload.text;
		},
	},
	extraReducers: (builder) => {
		// fetchCompetitions
		builder.addCase(fetchCompetitions.fulfilled, (state, action) => {
			state.error = '';
			state.competitionsFetchStatus = FetchStatus.success;
			state.competitions = action.payload;
		});
		builder.addCase(fetchCompetitions.rejected, (state, action) => {
			state.competitionsFetchStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(fetchCompetitions.pending, (state, action) => {
			state.competitionsFetchStatus = FetchStatus.pending;
		});
	},
	selectors: {
		selectCompetitions: state => state,
	},
});

export const { selectCompetitions } = competitionsSlice.selectors;
