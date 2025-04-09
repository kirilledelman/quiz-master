import { useCallback, useEffect, useState } from "react";

/*
custom hook for infinite load implementation
returns [ loading, setLoading ]
*/

export default function useInfiniteScroll(url, callback, config = { method: "GET" }) {
	const [loading, setLoading] = useState(false);

	// sets loading flag when scrolled to the bottom
	const handleScroll = useCallback(()=> {
		if ( !url || loading || Math.floor(window.innerHeight + document.documentElement.scrollTop) < Math.floor(document.documentElement.offsetHeight)) return;
		setLoading(true);
	},[url, loading] );

	// registers scroll event listener
	useEffect(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [handleScroll]);

	// actual load function
	const loadMore = useCallback( async () => {
		const response = await fetch(url, config);
		setLoading(false);
		callback(response);
	}, [url, config, callback]);

	// trigger load when loading flag changes
	useEffect(() => {
		if ( loading ) loadMore();
	}, [loadMore, loading]);

	return [ loading, setLoading ];
}