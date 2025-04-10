import { useCallback, useEffect, useState } from "react"

/*
	Custom hook for "infinite load" implementation on Quizzes Page
*/

export default function useInfiniteScroll(url, callback, config = { method: "GET" }) {
	const [loading, setLoading] = useState(false);

	// sets loading flag when scrolled to the bottom
	const handleScroll = useCallback(()=> {
		const distToBottom = Math.floor(document.documentElement.offsetHeight) - Math.floor(window.innerHeight + document.documentElement.scrollTop);
		if ( !url || loading || distToBottom > 8) return;
		setLoading(true);
	},[url, loading] );

	// registers scroll event listener
	useEffect(() => {
		window.addEventListener('scroll', handleScroll);
		window.addEventListener('wheel', handleScroll);
		return () => {
			window.removeEventListener('wheel', handleScroll);
			window.removeEventListener('scroll', handleScroll);
		}
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