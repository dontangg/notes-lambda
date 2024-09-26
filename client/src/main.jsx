import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import ErrorPage from "./ErrorPage";
import SignInPage from "./features/signIn/SignInPage";
import { store } from "./app/store";

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
				path: "/test",
				element: <Layout test={true} />,
			},
		]
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
