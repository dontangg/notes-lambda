import React from "react";
import { Link, useRouteError } from "react-router-dom";

export default function ErrorPage() {
	const error = useRouteError();
	console.error(error);

	const is404 = error.status === 404;

	return (
		<>
			<nav className="navbar navbar-expand-md bg-body-tertiary">
				<div className="container">
					<Link className="navbar-brand" to="/">Notes</Link>
				</div>
			</nav>
			<div className="bg-body-secondary vh-100 d-flex align-items-center ">
				<div className="container text-center">
					<h1>Oops!</h1>
					{is404
						? (<p>The page you are looking for does not exist. Try going <Link to="/">home</Link>.</p>)
						: (<p>Something bad happened. Maybe try <a href="javascript:window.location.reload()">refreshing the page</a>?</p>)
					}
					
				</div>
			</div>
		</>
	);
};