import styles from "./QuizzesPage.module.scss"
import { backendUrl, getAuthHeader } from "../util/common"
import { uiActions } from "../store/ui.js"
import InputField from "../components/InputField.jsx"
import PageInfo from "../components/PageInfo.jsx"
import useInfiniteScroll from '../hooks/useInfiniteScroll'
import QuizItem from "../components/QuizItem"
import LoadingSpinner from "../components/LoadingSpinner"
import { useDispatch, useSelector } from "react-redux"
import { Link, redirect, useSearchParams } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"

/*
	Page listing available quizzes by category, as well as filter
*/

export default function QuizzesPage() {
	const dispatch = useDispatch(),
		tab = useSelector( state => state.ui.quizzesTab),
		user = useSelector( state => state.user.user),
		[filter, setFilter ] = useState(""),
		[ items, setItems ] = useState( [] ),
		[ page, setPage ] = useState(0),
		[ quizzesUrl, setQuizzesUrl ] = useState(`${backendUrl}/quizzes/${tab}/${page}`),
		[ searchParams, setSearchParams] = useSearchParams(),
		[ fetchConfig, setFetchConfig ] = useState( { method: "GET", headers: { filter, ...getAuthHeader()} } ),
		[ loading, setLoading ] = useInfiniteScroll( quizzesUrl, loadCompleted, fetchConfig );

	// set tab from search params
	useEffect(() => {
		let t = searchParams.get('tab');
		if ( !user && t === 'user' ) t = 'all';
		if ( ['all', 'popular', 'user'].includes(t) ) {
			dispatch(uiActions.setQuizzesTab(t));
		}
	},[user, searchParams, setSearchParams, dispatch]);

	// tab button click switch
	function tabClicked(t){
		dispatch(uiActions.setQuizzesTab(t));
	}

	// callback for useInfiniteScroll custom hook
	async function loadCompleted(response){
		const moreItems = await response.json();
		// more items available
		if ( moreItems.length ) {
			setQuizzesUrl( `${backendUrl}/quizzes/${tab}/${page+1}` );
			setItems(items.concat(moreItems));
			setPage(page + 1);
		// no more
		} else {
			setQuizzesUrl( null );
		}
	}

	// callback for delete button on QuizItem
	const deleteQuiz = useCallback(async (item)=>{
		if ( item.ownerId === user?.id && confirm("Are you sure you want to delete this quiz?") ) {
			const response = await fetch(`${backendUrl}/quiz/${item.id}`, {
				method: "DELETE", headers: getAuthHeader()
			});
			if ( !response.ok ) {
				if ( response.status === 401 ) redirect("/login?logged-out");
				else dispatch(uiActions.showNotification(`There was a problem deleting "${item.title}"`));
			} else {
				// delete from local list
				items.splice(items.indexOf(item), 1);
				setItems(Array.from(items));
				dispatch(uiActions.showNotification(`Quiz "${item.title}" deleted`));
			}
		}
	}, [dispatch, items, user]);

	// callback for onChange for filter text field
	const filterChanged = useCallback((e)=>{
		const newFilter = e ? e.target.value : "";
		setFilter(newFilter);
	}, [setFilter] );

	// debounced refresh when filter or tab changes
	useEffect(() => {
		function refresh() {
			// refresh
			setFetchConfig({ method: "GET", headers: { "filter": filter, ...getAuthHeader()} });
			setItems([]);
			setPage(0);
			setQuizzesUrl(`${backendUrl}/quizzes/${tab}/0`);
			setLoading(true);
		}
		// delayed refresh
		const debounceTimer = setTimeout(refresh, 250);
		return () => clearTimeout(debounceTimer);
	}, [filter, setLoading, tab]);

	return (
	<article className={styles.QuizzesPage}>
	<h2>Quizzes
		<PageInfo>
			This page implements infinite scroll using a custom React hook to load more data when user scrolls to the bottom
		</PageInfo>
	</h2>

	<div className={styles.tabs}>
		<a className={tab === 'all' ? 'tab active' : 'tab'} onClick={()=>tabClicked('all')}>Recent</a>
		<a className={tab === 'popular' ? 'tab active' : 'tab'} onClick={()=>tabClicked('popular')}>Popular</a>
		{ user ?
			(<a className={tab === 'user' ? 'tab active' : 'tab'} onClick={()=>tabClicked('user')}>Your Quizzes</a>) :
			(<Link className="tab" to="/user/login?redirect=quizzes%3Ftab%3Duser">Your Quizzes</Link>) }
		<InputField className={styles.filter} value={filter} placeholder="Filter" onChange={filterChanged} thin clearButton/>
	</div>

	<ul className={styles.quizList}>{ items.map((item, i) => (
		<QuizItem key={i} item={item} onDelete={(tab === 'user') && deleteQuiz} />
	))}
	{ items.length === 0 && !loading && <li className={styles.empty}>Nothing to display.</li> }
	</ul>
	{ loading && <LoadingSpinner/> }
	</article>);
};