import { backendUrl } from "../util/common"
import { uiActions } from "../store/ui"
import { userActions } from "../store/user"
import ErrorMessage from "../components/ErrorMessage"
import InputField from "../components/InputField.jsx"
import PageInfo from "../components/PageInfo.jsx"
import { useActionState, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

/*
	User log in page
*/

export default function LogInPage() {
	const formRef = useRef(),
		dispatch = useDispatch(),
		navigate = useNavigate(),
		loggedInUser = useSelector(state => state.user.user),
		rememberedUsername= localStorage.getItem("remember-username") || '',
		defaultFormState = { username: rememberedUsername, remember: rememberedUsername !== '', errors:{} },
		[formState, formActionFunc, pending] = useActionState( handleAction, defaultFormState ),
		[redirect, setRedirect] = useState(''),
		[searchParams, setSearchParams] = useSearchParams();

	// search params effects
	useEffect(() => {
		// show logged out message if ?logged-out is set
		if ( searchParams.get("logged-out") !== null ) {
			dispatch(uiActions.showNotification("Please log in again"));
		}
		// save ?redirect=url
		const redir = searchParams.get("redirect");
		if ( redir ) setRedirect(redir);
	},[searchParams, setSearchParams, dispatch]);

	// form action
	async function handleAction( prevState, formData ) {
		// validation
		const username = formData.get("username"),
			password = formData.get("password"),
			remember = formData.get("remember"),
			formValues = { username, password };
		if ( username.length < 3 ) return { errors: { username: "Invalid username" }, ...formValues };
		if ( password.length < 5 ) return { errors: { password: "Invalid password" } , ...formValues };

		// send
		const response = await fetch(`${backendUrl}/user/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formValues), });

		// parse response
		const reply = await response.json();
		if ( !response.ok ) return { errors: { form: "Log in failed" }, ...formValues };

		// success
		localStorage.setItem("remember-username", remember ? username : "");
		dispatch(uiActions.showNotification(`Welcome, ${username}`));
		dispatch(userActions.loggedIn(reply));
		navigate('/' + redirect);
		return formValues;
	}

	// already logged in
	if ( loggedInUser?.username ) {
		return (<article className="narrow">
			<h2>Logged in as {loggedInUser.username}</h2>
			<div className="box">
				<Link to="/user/logout" className="button">Log Out</Link>
			</div>
		</article>);
	}

	// log in form
	return (<article className="narrow">
		<h2>Log in
			<PageInfo>
				This page uses React form action for data submission.
			</PageInfo>
		</h2>
		<form ref={formRef} className="box" action={formActionFunc}>
			<InputField name="username" label="Username" value={formState.username} error={formState.errors?.username} />
			<InputField name="password" label="Password" type="password" error={formState.errors?.password}/>
			<InputField name="remember" label="Remember username" type="checkbox" value={formState.remember} reverseLabel />
			{ formState.errors?.form && <ErrorMessage>{formState.errors.form}</ErrorMessage> }
			<button disabled={pending}>Log In</button>
			<Link to="/user/new">I do not have an account</Link>
		</form>
	</article>);
}