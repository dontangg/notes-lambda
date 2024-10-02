import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, savePassword, savePersonalInfo, selectAccount } from "./accountSlice";
import { FetchStatus } from "../../app/appFetch";
import Spinner from "../../common/Spinner";
import { useDocumentTitle } from "../../app/customHooks";

export default function AccountPage() {
	const dispatch = useDispatch();
	const passwordConfirmRef = useRef();
	const accountState = useSelector(selectAccount);
	const [isChangingPI, setIsChangingPI] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	const [typedName, setTypedName] = useState(accountState.name);
	const [piWasValidated, setPIWasValidated] = useState(false);

	const [typedCurPassword, setTypedCurPassword] = useState('');
	const [typedNewPassword, setTypedNewPassword] = useState('');
	const [typedNewPasswordConfirm, setTypedNewPasswordConfirm] = useState('');
	const [passwordWasValidated, setPasswordWasValidated] = useState(false);

	useDocumentTitle('Account');


	useEffect(() => {
		dispatch(fetchCurrentUser());
	}, []);

	useEffect(() => {
		if (accountState.accountFetchStatus === FetchStatus.success) {
			setTypedName(accountState.name);
		}
	}, [accountState.accountFetchStatus]);

	useEffect(() => {
		if (accountState.saveInfoStatus === FetchStatus.success) {
			setIsChangingPI(false);
		}
	}, [accountState.saveInfoStatus]);

	useEffect(() => {
		if (accountState.savePasswordStatus === FetchStatus.success) {
			setIsChangingPassword(false);
			setTypedCurPassword('');
			setTypedNewPassword('');
			setTypedNewPasswordConfirm('');
			setPasswordWasValidated(false);
		}
	}, [accountState.savePasswordStatus]);

	const onSavePasswordClick = (e) => {
		e.preventDefault();
		setPasswordWasValidated(true);
		if (typedCurPassword && typedNewPassword && typedNewPassword === typedNewPasswordConfirm) {
			dispatch(savePassword({ curPassword: typedCurPassword, newPassword: typedNewPassword }));
		}
	};

	const onSavePIClick = (e) => {
		e.preventDefault();
		setPIWasValidated(true);
		if (typedName) {
			dispatch(savePersonalInfo({ name: typedName }));
		}
	};

	passwordConfirmRef.current?.setCustomValidity(typedNewPassword === typedNewPasswordConfirm && typedNewPasswordConfirm ? '' : 'Passwords do not match');

	let content;
	if (isChangingPassword) {
		content = (
			<form className={passwordWasValidated ? 'was-validated' : ''} noValidate>
				<div className="mb-3">
					<label htmlFor="curPasswordInput" className="form-label">Current password</label>
					<input type="password" className="form-control" id="curPasswordInput" value={typedCurPassword} onChange={e => setTypedCurPassword(e.target.value)} required />
					<div className="invalid-feedback">
						Please enter your current password.
					</div>
				</div>
				<div className="mb-3">
					<label htmlFor="newPasswordInput" className="form-label">New password</label>
					<input type="password" className="form-control" id="newPasswordInput" value={typedNewPassword} onChange={e => setTypedNewPassword(e.target.value)} required />
					<div className="invalid-feedback">
						Please choose a new password.
					</div>
				</div>
				<div className="mb-3">
					<label htmlFor="newPasswordConfirmInput" className="form-label">Confirm new password</label>
					<input type="password" className="form-control" id="newPasswordConfirmInput" value={typedNewPasswordConfirm} onChange={e => setTypedNewPasswordConfirm(e.target.value)} ref={passwordConfirmRef} />
					<div className="invalid-feedback">
						The passwords do not match.
					</div>
				</div>
				<button type="submit" className="btn btn-primary" onClick={onSavePasswordClick} disabled={accountState.savePasswordStatus === FetchStatus.pending}>
					Save {accountState.savePasswordStatus === FetchStatus.pending ? (<Spinner />) : null}
				</button>
				{' '}
				<button type="button" className="btn btn-secondary" onClick={() => setIsChangingPassword(false)}>Cancel</button>
			</form>
		);
	} else if (isChangingPI) {
		content = (
			<form className={piWasValidated ? 'was-validated' : ''} noValidate>
				<div className="mb-3">
					<label htmlFor="nameInput" className="form-label">Name</label>
					<input type="text" className="form-control" id="nameInput" value={typedName} onChange={e => setTypedName(e.target.value)} required />
					<div className="invalid-feedback">
						Please enter a name.
					</div>
				</div>
				<div className="mb-3">
					<label htmlFor="emailInput" className="form-label">Email</label>
					<input type="email" className="form-control" id="emailInput" value={accountState.email} disabled />
				</div>
				<button type="submit" className="btn btn-primary" onClick={onSavePIClick} disabled={accountState.saveInfoStatus === FetchStatus.pending}>
					Save {accountState.saveInfoStatus === FetchStatus.pending ? (<Spinner />) : null}
				</button>
				{' '}
				<button type="button" className="btn btn-secondary" onClick={() => setIsChangingPI(false)}>Cancel</button>
			</form>
		);
	} else {
		content = (
			<>
				<table className="table table-striped align-middle">
					<thead>
						<tr>
							<th scope="colgroup" colSpan="2">Personal Information</th>
							<th scope="col" className="text-end"><button type="button" className="btn btn-secondary" onClick={() => setIsChangingPI(true)}>Edit</button></th>
						</tr>
					</thead>
					<tbody className="table-group-divider">
						<tr>
							<th scope="row">Name</th>
							<td colSpan="2">{accountState.name}</td>
						</tr>
						<tr>
							<th scope="row" style={{ width: '120px' }}>Email</th>
							<td colSpan="2">{accountState.email}</td>
						</tr>
					</tbody>
				</table>

				<table className="table table-striped align-middle">
					<thead>
						<tr>
							<th scope="colgroup" colSpan="2">Security</th>
							<th scope="col" className="text-end"><button type="button" className="btn btn-secondary" onClick={() => setIsChangingPassword(true)}>Edit</button></th>
						</tr>
					</thead>
					<tbody className="table-group-divider">
						<tr>
							<th scope="row" style={{ width: '120px' }}>Password</th>
							<td colSpan="2">********</td>
						</tr>
					</tbody>
				</table>
			</>
		);
	}

	return (
		<>
			<h1>Account</h1>
			{accountState.error && (<div className="alert alert-danger" role="alert">{accountState.error}</div>)}
			<div className="row">
				<div className="col-lg-6">
					{accountState.accountFetchStatus === FetchStatus.success && content}
				</div>
			</div>
		</>
	);
};
