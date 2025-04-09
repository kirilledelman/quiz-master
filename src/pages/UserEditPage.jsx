import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import { backendUrl, getAuthHeader } from "../util/common";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { uiActions } from "../store/ui";
import { userActions } from "../store/user";
import ErrorMessage from "../components/ErrorMessage";
import InputField from "../components/InputField.jsx";
import PageInfo from "../components/PageInfo.jsx";

// update user name and password router action
export async function action({ request }) {
	const formData = await request.formData(),
		username = formData.get('username'),
		password = formData.get('password'),
		aboutMe = formData.get('aboutMe'),
		showTaken = formData.get('showTaken') !== null,
		confirmPassword = formData.get('confirmPassword'),
		errors = {};

	// validate
	if ( username.length < 3 ) errors.username = "Username should be at least 3 characters";
	if ( password?.length > 0 ) {
		if ( password.length < 5 ) errors.password = "New password should be at least 5 characters";
		else if ( password !== confirmPassword ) errors.confirmPassword = "Password doesn't match";
	}
	if ( Object.keys(errors).length ) return { errors };

	// send
	const response = await fetch(`${backendUrl}/user`, {
		method: 'PATCH',
		headers: getAuthHeader(),
		body: JSON.stringify({
			username: username,
			password: password,
			extra: { aboutMe, showTaken }
		})
	});

	// handle errors
	if ( !response.ok ) {
		switch ( response.status ) {
			case 401: return redirect('/user/login?logged-out');
			case 403:
			case 404: return { errors: { form: "Invalid user ID" }};
			case 409: return { errors: { username: "Username already exists" }};
		}
	}
	return response;
}

export default function UserEditPage() {
	const navigation = useNavigation(),
		formRef = useRef(),
		dispatch = useDispatch(),
		user = useSelector(state => state.user.user),
		actionData = useActionData(),
		username = user?.username,
		aboutMe = user?.extra?.aboutMe || '',
		showTaken = !!user?.extra?.showTaken,
		errors = actionData?.errors || {};

	// process action from
	useEffect(() => {
		if ( actionData && actionData.success ) {
			dispatch(uiActions.showNotification("User information updated."));
			dispatch(userActions.updateUser(actionData.user));
			formRef.current.reset();
			// update remembered username
			if ( localStorage.getItem("remember-username") ) {
				localStorage.setItem("remember-username", actionData.user.username);
			}
		}
	}, [actionData, dispatch]);

	return (
	<article className="narrow">
		<h2>Account Settings
			<PageInfo>This page uses React Router action to update user profile, and useEffect to update React state with returned useActionData.</PageInfo>
		</h2>
		<Form ref={formRef} className="box" method="POST">
			<InputField name="username" label="Username" minLength="3" maxLength="24" value={username} error={errors.username} />
			<InputField name="aboutMe" label="About me" type="textarea" value={aboutMe} />
			<InputField name="showTaken" label="My quiz results are public" reverseLabel type="checkbox" value={showTaken} />
			<InputField name="password" type="password" label="New password" minLength="5" maxLength="64" error={errors.password}/>
			<InputField name="confirmPassword" type="password" label="Retype" maxLength="64" error={errors.confirmPassword}/>
			{ errors.form && <ErrorMessage>{errors.form}</ErrorMessage> }
			<button disabled={navigation.state !== 'idle'} type="submit">Update Details</button>
		</Form>

		<footer>

		</footer>
	</article>);
}