import Header from "../components/Header.jsx"
import {Link, useRouteError} from "react-router-dom"

/*
	Basic error page
*/

export default function ErrorPage() {
	const routeError = useRouteError();

	// get error message
	let errorTitle = "Oops",
		errorMessage = "An error occurred.";
	if (routeError) {
		if (routeError.status === 404) {
			errorTitle = "Error 404";
			errorMessage = "Looks like this URL is invalid.";
		} else if (routeError.data) {
			errorMessage = routeError.data.message;
		} else {
			errorTitle = "Error";
			errorMessage = routeError.message;
		}
		console.error(routeError);
	}

	return (
		<main>
			<Header/>
			<article>
				<h2>{errorTitle}</h2>
				<div>{errorMessage}</div>
				<hr/>
				<p>Press <strong>Back</strong> in your browser, or go to the <Link to="/">home page</Link>.</p>
			</article>
		</main>
	)
}