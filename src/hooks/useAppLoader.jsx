import { useDispatch, useSelector } from "react-redux"
import { backendUrl, getAuthHeader } from "../util/common"
import { userActions } from "../store/user"
import { useEffect, useState } from "react"

/*
	Custom hook used at App level that logs user in if there's auth token stored in localStorage
*/

export default function useAppLoader() {
	const dispatch = useDispatch(),
		user = useSelector((state) => state.user.user),
		[ loading, setLoading ] = useState(true);

	// if have stored token but user is null, try to log user in
	useEffect(() => {
		async function persistUser() {
			try {
				const response = await fetch(`${backendUrl}/user/login`, {
					method: "POST",
					headers: getAuthHeader()
				});
				const reply = await response.json();
				if ( reply && reply.success ) {
					dispatch(userActions.loggedIn(reply));
				} else throw response;

				// loading finished
				setLoading(false);
			} catch (e) {
				dispatch(userActions.loggedOut());
			}
			setLoading(false);
		}

		// if not logged in but have unexpired token
		if ( !user ) {
			const exp= new Date(parseInt(localStorage.getItem("authExpires") || 0)),
				  token = localStorage.getItem('auth');
			if ( token && exp > new Date()) persistUser();
			else {
				localStorage.removeItem('auth');
				localStorage.removeItem('authExpires');
				setLoading(false);
			}
		} else setLoading(false);
	}, [user, dispatch]);

	return loading;
}

