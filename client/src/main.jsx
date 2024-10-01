import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { store } from "./app/store";
import Layout from "./Layout";
import ErrorPage from "./ErrorPage";
import SignInPage from "./features/signIn/SignInPage";
import AccountPage from "./features/account/AccountPage";
import CompetitionsPage from "./features/competitions/CompetitionsPage";
import NewCompetitionPage from "./features/competitions/NewCompetitionPage";

const router = createBrowserRouter([
	{
		element: <Layout />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "/",
				element: <div>Home</div>,
			},
			{
				path: "/account",
				element: <AccountPage />,
			},
			{
				path: "/competitions",
				element: <CompetitionsPage />,
			},
			{
				path: "/competitions/new",
				element: <NewCompetitionPage />,
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
