import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { signInSlice } from "../features/signIn/signInSlice";

const rootReducer = combineSlices(signInSlice);

// The store setup is wrapped in `makeStore` to allow reuse
// when setting up tests that need the same store config
export const makeStore = (preloadedState) => {
	return configureStore({
		reducer: rootReducer,
		preloadedState,
	});
};

export const store = makeStore();
