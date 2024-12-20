import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Link, Navigate, NavLink } from "react-router-dom";
import { selectSignIn, signOut } from "./features/signIn/signInSlice";
import { CompetitionPhase, fetchAllUsers, fetchCurrentCompetition, selectAllUsers, selectCurrentCompetition } from "./features/competitions/competitionsSlice";

const Layout = () => {
	const dispatch = useDispatch();
	const signInState = useSelector(selectSignIn);
	const currentCompetition = useSelector(selectCurrentCompetition);
	const allUsers = useSelector(selectAllUsers);
	const [mainMenuIsOpen, setMainMenuIsOpen] = useState(false);
	const [userMenuIsOpen, setUserMenuIsOpen] = useState(false);
	const accountDropdownRef = useRef(null);

	useEffect(() => {
		if (!currentCompetition) {
			dispatch(fetchCurrentCompetition());
		}
		if (!allUsers) {
			dispatch(fetchAllUsers());
		}
	}, []);

	// NOTE: This has to be included after all hooks
	if (!signInState.authToken) {
		return (<Navigate to="/signin" replace />);
	}

	const onBodyClick = (e) => {
		if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
			setUserMenuIsOpen(false);
		}
	};

	const onSignOutClick = (e) => {
		e.preventDefault();
		dispatch(signOut());
	};

	return (
		<>
			<nav className="navbar navbar-expand-md bg-body-tertiary mb-4" onClick={onBodyClick}>
				<div className="container">
					<Link className="navbar-brand" to="/">Notes</Link>
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
							{currentCompetition?.phase === CompetitionPhase.guessing && (
								<li className="nav-item">
									<NavLink className="nav-link" aria-current="page" to="/guess">New Guess</NavLink>
								</li>
							)}
							{currentCompetition && (
								<li className="nav-item">
									<NavLink className="nav-link" to="/scorecard/current">Scorecard</NavLink>
								</li>
							)}
							<li className="nav-item">
								<NavLink className="nav-link" to="/song">Songs</NavLink>
							</li>
							<li className="nav-item">
								<NavLink className="nav-link" to="/competition">Competitions</NavLink>
							</li>
							<li className="nav-item d-block d-md-none">
								<NavLink className="nav-link" to="/account">Account</NavLink>
							</li>
							<li className="nav-item d-block d-md-none">
								<a className="nav-link" href="#" onClick={onSignOutClick}>Sign Out</a>
							</li>
						</ul>
						<ul className="navbar-nav d-flex d-none d-md-block">
							<li className="nav-item dropdown">
								<button
									className={'nav-link dropdown-toggle' + (userMenuIsOpen ? ' show' : '')}
									type="button"
									aria-expanded={userMenuIsOpen ? 'true' : 'false'}
									onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
									ref={accountDropdownRef}>
									<i className="fa-regular fa-user"></i>
								</button>
								<ul className={'dropdown-menu dropdown-menu-end' + (userMenuIsOpen ? ' show' : '')} style={{ right: 0 }}>
									<li><NavLink className="dropdown-item" to="/account">Account</NavLink></li>
									<li><a className="dropdown-item" href="#" onClick={onSignOutClick}>Sign Out</a></li>
								</ul>
							</li>
						</ul>
					</div>
				</div>
			</nav>
			<div className="container" onClick={onBodyClick}>
				<Outlet />
			</div>
		</>
	);
};

export default Layout;
