import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Quotes } from "./features/quotes/Quotes";

const App = (props) => {
	const logo = new URL('logo.svg', import.meta.url);

	if (props.test) return <div>test</div>;

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<Link to={`/test`}>test</Link>
				<Link to={`/asdf`}>asdf</Link>
				<Outlet />
				<p>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<Quotes />
				<span>
					<span>Learn </span>
					<a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
						React
					</a>
					<span>, </span>
					<a className="App-link" href="https://redux.js.org" target="_blank" rel="noopener noreferrer">
						Redux
					</a>
					<span>, </span>
					<a className="App-link" href="https://redux-toolkit.js.org" target="_blank" rel="noopener noreferrer">
						Redux Toolkit
					</a>
					<span>, </span>
					<a className="App-link" href="https://react-redux.js.org" target="_blank" rel="noopener noreferrer">
						React Redux
					</a>
					,<span> and </span>
					<a className="App-link" href="https://reselect.js.org" target="_blank" rel="noopener noreferrer">
						Reselect
					</a>
				</span>
			</header>
		</div>
	);
};

export default App;
