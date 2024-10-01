import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import appFetch, { FetchStatus } from '../../app/appFetch';

const initialState = {
	competitionsFetchStatus: FetchStatus.idle,
	competitionSaveStatus: FetchStatus.idle,
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

export const saveCompetition = createAsyncThunk(
	'competitions/saveCompetition',
	async (arg, { dispatch, getState }) => {
		const body = JSON.stringify(arg);
		return appFetch('/competition', { method: 'POST', body }, dispatch, getState).then(() => arg);
	}, {
		condition: (arg, { getState, extra }) => {
			const competitionsState = getState().competitions;
			return competitionsState.competitionSaveStatus !== FetchStatus.pending;
		}
	},
);

export const deleteCompetition = createAsyncThunk(
	'competitions/deleteCompetition',
	async (comp, { dispatch, getState }) => {
		const body = JSON.stringify(comp);
		return appFetch('/competition', { method: 'DELETE', body }, dispatch, getState).then(() => comp);
	}, {
		condition: (arg, { getState, extra }) => {
			const competitionsState = getState().competitions;
			return competitionsState.competitionSaveStatus !== FetchStatus.pending;
		}
	},
);


export const competitionsSlice = createSlice({
	name: 'competitions',
	initialState,
	reducers: {
		// changeSignInField: (state, action) => {
		// 	state[action.payload.fieldName] = action.payload.text;
		// },
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
		// saveCompetition
		builder.addCase(saveCompetition.fulfilled, (state, action) => {
			state.error = '';
			state.competitionSaveStatus = FetchStatus.success;
			const updatedComp = state.competitions.find(c => c.name === action.payload.name);
			if (updatedComp) {
				updatedComp.phase = action.payload.phase;
			} else {
				state.competitions.push(action.payload);
			}
		});
		builder.addCase(saveCompetition.rejected, (state, action) => {
			state.competitionSaveStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(saveCompetition.pending, (state, action) => {
			state.competitionSaveStatus = FetchStatus.pending;
		});
		// deleteCompetition
		builder.addCase(deleteCompetition.fulfilled, (state, action) => {
			state.error = '';
			state.competitionSaveStatus = FetchStatus.success;
			state.competitions = state.competitions.filter(c => c.name !== action.payload.name);
		});
		builder.addCase(deleteCompetition.rejected, (state, action) => {
			state.competitionSaveStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(deleteCompetition.pending, (state, action) => {
			state.competitionSaveStatus = FetchStatus.pending;
		});
	},
	selectors: {
		selectCompetitions: state => state,
	},
});

export const { selectCompetitions } = competitionsSlice.selectors;

// export const { changeSignInField } = competitionsSlice.actions;
