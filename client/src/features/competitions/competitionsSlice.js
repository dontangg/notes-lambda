import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import appFetch, { FetchStatus } from '../../app/appFetch';
import { uploadFile } from '../../app/utilities';

const initialState = {
	allUsers: null,
	allUsersFetchStatus: FetchStatus.idle,
	competitionsFetchStatus: FetchStatus.idle,
	curCompFetchStatus: FetchStatus.idle,
	competitionSaveStatus: FetchStatus.idle,
	songSaveStatus: FetchStatus.idle,
	uploadSongStatus: FetchStatus.idle,
	competitions: null,
	currentCompetition: null,
	error: '',
};

export const CompetitionPhase = {
	submitting: 'submitting',
	guessing: 'guessing',
	closed: 'closed',
};

export const fetchAllUsers = createAsyncThunk(
	'competitions/fetchAllUsers',
	async (arg, { dispatch, getState }) => {
		return appFetch('/users', null, dispatch, getState).then(response => response.json());
	}, {
		condition: (arg, { getState, extra }) => {
			const competitionsState = getState().competitions;
			return competitionsState.allUsersFetchStatus !== FetchStatus.pending;
		}
	},
);

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

export const fetchCurrentCompetition = createAsyncThunk(
	'competitions/fetchCurrentCompetition',
	async (arg, { dispatch, getState }) => {
		return appFetch('/competition/current', null, dispatch, getState).then(response => response.json());
	}, {
		condition: (arg, { getState, extra }) => {
			const competitionsState = getState().competitions;
			return competitionsState.curCompFetchStatus !== FetchStatus.pending;
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

export const saveSong = createAsyncThunk(
	'competitions/saveSong',
	async (comp, { dispatch, getState }) => {
		const body = JSON.stringify(comp);
		return appFetch('/song', { method: 'POST', body }, dispatch, getState).then(response => response.json());
	}, {
		condition: (arg, { getState, extra }) => {
			const competitionsState = getState().competitions;
			return competitionsState.songSaveStatus !== FetchStatus.pending;
		}
	},
);

export const deleteSong = createAsyncThunk(
	'competitions/deleteSong',
	async (songId, { dispatch, getState }) => {
		return appFetch(`/song/${songId}`, { method: 'DELETE' }, dispatch, getState).then(() => songId);
	}, {
		condition: (arg, { getState, extra }) => {
			const competitionsState = getState().competitions;
			return competitionsState.songSaveStatus !== FetchStatus.pending;
		}
	},
);

export const uploadSong = createAsyncThunk(
	'competitions/uploadSong',
	async (arg, { dispatch, getState }) => {
		const { filename, extension, type, file } = arg
		const body = { filename, extension, type };
		return appFetch('/song_upload_url', { method: 'POST', body: JSON.stringify(body) }, dispatch, getState)
			.then(response => response.json())
			.then(({ uploadUrl }) => uploadFile(file, uploadUrl))
			.then(() => {
				return appFetch('/trigger_transcoder', { method: 'POST', body: JSON.stringify(body) }, dispatch, getState)
			})
			.then(() => body);
	}, {
		condition: (arg, { getState, extra }) => {
			const competitionsState = getState().competitions;
			return competitionsState.uploadSongStatus !== FetchStatus.pending;
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
		builder.addCase(fetchAllUsers.fulfilled, (state, action) => {
			state.error = '';
			state.allUsersFetchStatus = FetchStatus.success;
			state.allUsers = action.payload;
		});
		builder.addCase(fetchAllUsers.rejected, (state, action) => {
			state.allUsersFetchStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(fetchAllUsers.pending, (state, action) => {
			state.allUsersFetchStatus = FetchStatus.pending;
		});
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
		// fetchCurrentCompetition
		builder.addCase(fetchCurrentCompetition.fulfilled, (state, action) => {
			state.error = '';
			state.curCompFetchStatus = FetchStatus.success;
			state.currentCompetition = action.payload;
		});
		builder.addCase(fetchCurrentCompetition.rejected, (state, action) => {
			state.curCompFetchStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(fetchCurrentCompetition.pending, (state, action) => {
			state.curCompFetchStatus = FetchStatus.pending;
		});
		// saveCompetition
		builder.addCase(saveCompetition.fulfilled, (state, action) => {
			state.error = '';
			state.competitionSaveStatus = FetchStatus.success;
			const updatedComp = state.competitions.find(c => c.name === action.payload.name);
			if (updatedComp) {
				updatedComp.phase = action.payload.phase;
				if (updatedComp.name === state.currentCompetition?.name) {
					if (updatedComp.phase === CompetitionPhase.closed) {
						state.currentCompetition = null;
					} else {
						state.currentCompetition.phase = updatedComp.phase;
					}
				}
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
		// saveSong
		builder.addCase(saveSong.fulfilled, (state, action) => {
			state.error = '';
			state.songSaveStatus = FetchStatus.success;
			const updatedSong = action.payload.song;
			const songToUpdate = state.currentCompetition.songs?.find(s => s.id === updatedSong.id);
			if (songToUpdate) {
				for (const prop in songToUpdate) {
					songToUpdate[prop] = updatedSong[prop];
				}
			} else {
				if (!state.currentCompetition.songs) {
					state.currentCompetition.songs = [];
				}
				state.currentCompetition.songs.push(updatedSong);
			}
		});
		builder.addCase(saveSong.rejected, (state, action) => {
			state.songSaveStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(saveSong.pending, (state, action) => {
			state.songSaveStatus = FetchStatus.pending;
		});
		// deleteSong
		builder.addCase(deleteSong.fulfilled, (state, action) => {
			state.error = '';
			state.songSaveStatus = FetchStatus.success;
			state.currentCompetition.songs = state.currentCompetition.songs.filter(s => s.id !== action.payload);
		});
		builder.addCase(deleteSong.rejected, (state, action) => {
			state.songSaveStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(deleteSong.pending, (state, action) => {
			state.songSaveStatus = FetchStatus.pending;
		});
		// uploadSong
		builder.addCase(uploadSong.fulfilled, (state, action) => {
			state.error = '';
			state.uploadSongStatus = FetchStatus.success;
		});
		builder.addCase(uploadSong.rejected, (state, action) => {
			state.uploadSongStatus = FetchStatus.error;
			state.error = action.error.message;
		});
		builder.addCase(uploadSong.pending, (state, action) => {
			state.uploadSongStatus = FetchStatus.pending;
		});
	},
	selectors: {
		selectCompetitions: state => state,
		selectCurrentCompetition: state => state.currentCompetition,
		selectAllUsers: state => state.allUsers,
	},
});

export const { selectAllUsers, selectCompetitions, selectCurrentCompetition } = competitionsSlice.selectors;

// export const { changeSignInField } = competitionsSlice.actions;
