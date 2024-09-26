import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
	const [mainMenuIsOpen, setMainMenuIsOpen] = useState(false);
	const [userMenuIsOpen, setUserMenuIsOpen] = useState(false);

	return (
		<>
			<nav className="navbar navbar-expand-md bg-body-tertiary">
				<div className="container">
					<a className="navbar-brand" href="#">Notes</a>
					<button
						className="navbar-toggler"
						type="button"
						aria-controls="navbarSupportedContent"
						aria-expanded={mainMenuIsOpen ? 'true' : 'false'}
						aria-label="Toggle navigation"
						onClick={() => setMainMenuIsOpen(!mainMenuIsOpen)}>
							<span className="navbar-toggler-icon"></span>
					</button>
					<div className={'collapse navbar-collapse' + (mainMenuIsOpen ? ' show' : '')} id="navbarSupportedContent">
						<ul className="navbar-nav me-auto mb-2 mb-lg-0">
							<li className="nav-item">
								<a className="nav-link active" aria-current="page" href="#">New Guess</a>
							</li>
							<li className="nav-item">
								<a className="nav-link" href="#">Scorecard</a>
							</li>
							<li className="nav-item">
								<a className="nav-link" href="#">My Songs</a>
							</li>
							<li className="nav-item">
								<a className="nav-link" href="#">Competitions</a>
							</li>
							<li className="nav-item d-block d-md-none">
								<a className="nav-link" href="#">Sign Out</a>
							</li>
						</ul>
						<ul className="navbar-nav d-flex d-none d-md-block">
							<li className="nav-item dropdown">
								<button
									className={'nav-link dropdown-toggle' + (userMenuIsOpen ? ' show' : '')}
									type="button"
									aria-expanded={userMenuIsOpen ? 'true' : 'false'}
									onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}>
										Don
								</button>
								<ul className={'dropdown-menu dropdown-menu-end' + (userMenuIsOpen ? ' show' : '')} style={{ right: 0 }}>
									<li><a className="dropdown-item" href="#">Sign Out</a></li>
								</ul>
							</li>
						</ul>
					</div>
				</div>
			</nav>
			<div className="container">
				<div className="container py-4 px-3 mx-auto">
					<h1>Hello, Bootstrap and Parcel!</h1>
					<button className="btn btn-primary">Primary button</button>
				</div>

				<Link to={`/test`}>test</Link>
				<Link to={`/asdf`}>asdf</Link>
				<Outlet />
				<p>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
			</div>
		</>
	);
};

export default Layout;
