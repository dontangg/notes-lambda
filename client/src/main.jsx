import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import { store } from "./app/store";
import Layout from "./Layout";
import ErrorPage from "./ErrorPage";
import SignInPage from "./features/signIn/SignInPage";
import AccountPage from "./features/account/AccountPage";
import CompetitionsPage from "./features/competitions/CompetitionsPage";
import NewCompetitionPage from "./features/competitions/NewCompetitionPage";
import ScorecardPage from "./features/competitions/ScorecardPage";
import SongsPage from "./features/competitions/SongsPage";
import SongEditPage from "./features/competitions/SongEditPage";
import NewGuessPage from "./features/competitions/NewGuessPage";
import { CompetitionPhase, selectCompetitions } from "./features/competitions/competitionsSlice";
import { FetchStatus } from "./app/appFetch";

const HomePage = () => {
	const navigate = useNavigate();
	const competitionsState = useSelector(selectCompetitions);

	useEffect(() => {
		if (competitionsState.curCompFetchStatus !== FetchStatus.success) return;

		if (competitionsState.currentCompetition) {
			if (competitionsState.currentCompetition.phase === CompetitionPhase.submitting) {
				navigate('/song');
				return;
			} else {
				navigate('/scorecard/current');
				return;
			}
		}
	
		navigate('/competition');

	}, [competitionsState.curCompFetchStatus]);

	return null;
};

const router = createBrowserRouter([
	{
		element: <Layout />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "/",
				element: <HomePage />,
			},
			{
				path: "/account",
				element: <AccountPage />,
			},
			{
				path: "/guess",
				element: <NewGuessPage />,
			},
			{
				path: "/competition",
				element: <CompetitionsPage />,
			},
			{
				path: "/competition/new",
				element: <NewCompetitionPage />,
			},
			{
				path: "/scorecard/:name",
				element: <ScorecardPage />,
			},
			{
				path: "/song",
				element: <SongsPage />,
			},
			{
				path: "/song/:id",
				element: <SongEditPage />,
			},
		],
	},
	{
		element: <SignInPage />,
		errorElement: <ErrorPage />,
		path: "/signin",
	},
]);

const root = createRoot(document.getElementById("root"));

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<RouterProvider router={router} />
		</Provider>
	</React.StrictMode>
);
