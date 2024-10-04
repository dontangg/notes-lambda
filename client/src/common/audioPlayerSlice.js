import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	audioInfo: {},
	isPlaying: false,
};

const getDefaultInfo = () => ({
	canPlay: false,
	duration: 0,
});

export const audioPlayerSlice = createSlice({
	name: 'audioPlayer',
	initialState,
	reducers: {
		setCanPlay: (state, action) => {
			if (!state.audioInfo[action.payload.filename]) {
				state.audioInfo[action.payload.filename] = getDefaultInfo();
			}
			state.audioInfo[action.payload.filename].canPlay = action.payload.canPlay;
		},
		setAudioDuration: (state, action) => {
			if (!state.audioInfo[action.payload.filename]) {
				state.audioInfo[action.payload.filename] = getDefaultInfo();
			}
			state.audioInfo[action.payload.filename].duration = action.payload.duration;
		},
		setIsPlaying: (state, action) => {
			state.isPlaying = action.payload;
		},
	},
	selectors: {
		selectAudioPlayer: state => state,
	},
});

export const { selectAudioPlayer } = audioPlayerSlice.selectors;

export const { setAudioDuration, setCanPlay, setIsPlaying } = audioPlayerSlice.actions;
