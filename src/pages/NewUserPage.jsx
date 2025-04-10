import { useActionState, useEffect, useState } from "react";
import {useDispatch} from "react-redux";
import { backendUrl } from "../util/common";
import { uiActions } from "../store/ui";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {userActions} from "../store/user";
import ErrorMessage from "../components/ErrorMessage";
import InputField from "../components/InputField.jsx";
import PageInfo from "../components/PageInfo.jsx";

export default function NewUserPage() {
	const dispatch = useDispatch(),
		navigate = useNavigate(),
		[redirect, setRedirect] = useState(''),
		[searchParams, setSearchParams] = useSearchParams();

	// search params effects
	useEffect(() => {
		// save redirect url
		const redir = searchParams.get("redirect");
		if ( redir ) setRedirect(redir);
		// clear query in location
		setSearchParams({});
	},[searchParams, setSearchParams, dispatch]);

	async function handleAction( prevState, formData ) {
		// validation
		const username = formData.get("username"),
			password = formData.get("password"),
			formValues = { username, password, errors: {} };
		if ( username.length < 3 || username.length > 24 ) return { errors: { username: "Username should be 3-24 chars long" }, ...formValues };
		if ( username.match(/[^a-zA-Z0-9_]/) ) return { errors: { username: "Username can only contain alphanumerical characters" }, ...formValues };
		if ( password.length < 5 || password.length > 64) return { errors: { password: "Password should be at between 5 and 64 characters" }, ...formValues };

		// send
		const response = await fetch(`${backendUrl}/user/new`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formValues) });

		// parse response
		const reply = await response.json();
		if ( !response.ok ) return { errors: { form: reply.message }, ...formValues };

		// success
		dispatch(userActions.loggedIn(reply));
		dispatch(uiActions.showNotification("Account created successfully."));
		navigate('/' + redirect);
		return formValues;
	}

	const [formState, formActionFunc, pending] = useActionState( handleAction, {} );
	return (
	<article className="narrow">
		<h2>New User
			<PageInfo>
				This page uses React form action for data submission.
			</PageInfo>
		</h2>
		<form className="box" action={formActionFunc}>
			<InputField name="username" label="Username" minLength="3" maxLength="16" value={formState.username} error={formState.errors?.username} />
			<InputField name="password" label="Password" minLength="5" maxLength="32" type="password" value={formState.password} error={formState.errors?.password} />
			<ErrorMessage>{formState.errors?.form}</ErrorMessage>
			<button disabled={pending}>Create Account</button>
			<Link to="/user/login">I already have an account</Link>
		</form>
	</article>);
}