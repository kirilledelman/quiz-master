import { redirect } from "react-router-dom"

/*
	Common util functions
*/

const dateFormatter = Intl.DateTimeFormat( 'en-US');

// outputs relative time between now and yesterday (e.g. "3 hours ago"), or date otherwise
export function formatTimestamp(time) {
	var time_formats = [
		[60, 's', 1], // 60
		[120, '1m ago'], // 60*2
		[3600, 'm', 60], // 60*60, 60
		[7200, '1h ago'], // 60*60*2
		[86400, 'hrs', 3600], // 60*60*24, 60*60
		[172800, 'yesterday'], // 60*60*24*2
	];
	let seconds = (new Date().getTime() - time) / 1000, token = 'ago';
	if (seconds === 0) return 'just now';
	for ( let i in time_formats ) {
		const format = time_formats[ i ];
		if (seconds < format[0]) {
			if (i % 2)
				return format[1];
			else
				return Math.floor(seconds / format[2]) + '' + format[1] + ' ' + token;
		}
	}
	// just date
	return dateFormatter.format(new Date(time));
}

// returns basic headers with content type as json, with auth token for use with fetch(), if logged in
export function getAuthHeader() {
	const headers = { 'Content-Type': 'application/json' };
	const token = localStorage.getItem('auth');
	if ( token ) headers.Authorization = `Bearer ${token}`;
	return headers;
}

// loader for auth only pages, that simply redirects to /user/login if no token in localStorage
export function authOnlyLoader() {
	const token = localStorage.getItem('auth');
	if ( !token ) return redirect('/user/login?logged-out');
	return new Response(); // ok
}

// common backend URL based on window.location
export const backendUrl = `${window.location.protocol}//${window.location.hostname}:10000`;