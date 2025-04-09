import { useEffect } from "react";
import { userActions } from "../store/user.js";
import { uiActions } from "../store/ui.js";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { backendUrl, getAuthHeader } from "../util/common.js";

export default function LogOutPage() {
	const dispatch = useDispatch(),
		navigate = useNavigate();

	useEffect(() => {
		fetch(`${backendUrl}/user/logout`, { method: 'POST', headers: getAuthHeader() } );
		dispatch(userActions.loggedOut());
		dispatch(uiActions.resetTabs());
		setTimeout(() => {
			dispatch(uiActions.showNotification("Logged out"));
			navigate('/');
		}, 1000 );
	},[dispatch, navigate]);

	return (<article>
		<h2>Logging Out..</h2>
	</article>)
}