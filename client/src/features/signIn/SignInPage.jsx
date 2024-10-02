import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { fetchSignIn, selectSignIn } from "./signInSlice";
import Spinner from "../../common/Spinner";
import { FetchStatus } from "../../app/appFetch";
import { useDocumentTitle } from "../../app/customHooks";

export default function SignInPage() {
	const dispatch = useDispatch();
	const signInState = useSelector(selectSignIn);
	const location = useLocation();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [didSubmit, setDidSubmit] = useState(false);
	useDocumentTitle('Sign In');

	if (signInState.authToken) {
		const route = (location.state?.from) || { pathname: "/" };
		return (<Navigate to={route} replace />);
	}

	const onSignInClick = (e) => {
		e.preventDefault();
		setDidSubmit(true);
		if (email && password) {
			dispatch(fetchSignIn({ email, password }));
		}
	};

	const isEmailValid = !didSubmit || email;
	const isPasswordValid = !didSubmit || password;

	return (
		<div className="signInPage d-flex align-items-center vh-100 vw-100 bg-body-secondary">
			<form className={'container bg-body border rounded border-secondary-subtle p-4' + (didSubmit ? ' was-validated' : '')} noValidate>
				<h1>
					<svg width="40" height="45" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
						<path id="Path" fill="#000000" fillRule="evenodd" stroke="none" d="M 85 50 L 212 18 L 212 165 C 212 165 208.298538 194 178 194 C 153 194 143.065262 176.044418 143 163 C 142.918457 146.700684 159.817871 132.783203 177 133 C 191.514847 133.183136 200 141 200 141 L 200 63 L 97 88 L 97 198 C 97 198 89.87793 221.59082 63 222 C 36.12207 222.40918 28.060547 202.171875 28 192 C 27.939453 181.828125 39.128101 162.322052 63 162 C 79.577148 161.776367 85 170 85 170 L 85 50 Z" />
					</svg>
					<span className="ps-2">Sign in</span>
				</h1>
				<div className="input-group mb-3 has-validation">
					<div className={'form-floating' + (!isEmailValid ? ' is-invalid' : '')}>
						<input type="email"
							className={'form-control' + (!isEmailValid ? ' is-invalid' : '')}
							id="emailInput"
							placeholder="name@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required />
						<label htmlFor="emailInput">Email address</label>
					</div>
					<div className="invalid-feedback">
						Please enter your email address.
					</div>
				</div>
				<div className="input-group mb-3 has-validation">
					<div className={'form-floating' + (!isPasswordValid ? ' is-invalid' : '')}>
						<input type="password"
							className={'form-control' + (!isPasswordValid ? ' is-invalid' : '')}
							id="passwordInput"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required />
						<label htmlFor="passwordInput">Password</label>
					</div>
					<div className="invalid-feedback">
						Please enter your password.
					</div>
				</div>
				{signInState.error && (<div className="alert alert-danger" role="alert">{signInState.error}</div>)}
				<button type="submit" className="btn btn-primary" onClick={onSignInClick} disabled={signInState.signInStatus === FetchStatus.pending}>
					Sign in {signInState.signInStatus === FetchStatus.pending ? (<Spinner />) : null}
				</button>
			</form>
		</div>
	);
}