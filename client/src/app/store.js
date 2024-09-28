import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { signInSlice } from "../features/signIn/signInSlice";
import { accountSlice } from "../features/account/accountSlice";
import { competitionsSlice } from "../features/competitions/competitionsSlice";

const rootReducer = combineSlices(signInSlice, accountSlice, competitionsSlice);

// The store setup is wrapped in `makeStore` to allow reuse
// when setting up tests that need the same store config
export const makeStore = (preloadedState) => {
	return configureStore({
		reducer: rootReducer,
		preloadedState,
	});
};

export const store = makeStore();
