import { backendUrl, formatTimestamp, getAuthHeader } from "../util/common.js";
import { Link, redirect, useLoaderData, useRevalidator } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import QuizItem from "../components/QuizItem.jsx";
import { uiActions } from "../store/ui.js";
import QuizResultItem from "../components/QuizResultItem.jsx";
import styles from "./UserPage.module.scss";
import Icon from "../components/Icon.jsx";
import PageInfo from "../components/PageInfo.jsx";

export async function userLoader({ params }) {
	const response = await fetch(`${backendUrl}/user/${params.userId || 0}`,
		{ method: 'GET', headers: getAuthHeader() });

	// auth failed
	if ( response.status === 401 ) return redirect('/user/login?logged-out');
	if ( !response.ok ) throw response;
	return response;
}

export default function UserPage() {
	const dispatch = useDispatch(),
		revalidator = useRevalidator(),
		loaderData = useLoaderData(),
		user = useSelector((state) => state.user.user),
		showingThisUser = (user && user.id === loaderData.user.id),
		showTakenTab = showingThisUser || loaderData.user.extra.showTaken,
		tab = useSelector( state => state.ui.userTab ),
		quizzes = loaderData.quizzes.sort((a, b) => b.updated - a.updated),
		results = loaderData.results.sort((a, b) => b.highestTimestamp - a.highestTimestamp);

	async function deleteQuiz(item) {
		if ( item.ownerId === user?.id && confirm("Are you sure you want to delete this quiz?") ) {
			const response = await fetch(`${backendUrl}/quiz/${item.id}`, {
				method: "DELETE", headers: getAuthHeader()
			});
			if ( !response.ok ) {
				if ( response.status === 401 ) redirect("/login?logged-out");
				else dispatch(uiActions.showNotification(`There was a problem deleting "${item.title}"`));
			} else {
				// refresh
				dispatch(uiActions.showNotification(`Quiz "${item.title}" deleted`));
				revalidator.revalidate(); // reloads data from loader
			}
		}
	}

	return (<article className={styles.UserPage}>
		<h2>{showingThisUser ?
			(<>Your Profile<span className="flex"/><Link className="button small" to="/user/edit">Account Settings</Link></>) : ("User")}
			<PageInfo>
				This page uses React router loader to retrieve user info.
			</PageInfo>
		</h2>
		<div className={styles.card}>
			<Icon icon="user"/>
			<h2 className={styles.username}>{loaderData.user.username}</h2>
			<span className={styles.created}>Joined {formatTimestamp(loaderData.user.created)}</span>
			<div className={styles.about}>{loaderData.user.extra.aboutMe}</div>
		</div>
		<div className={styles.tabs}>
			<a className={tab === 'quizzes' ? 'tab active' : 'tab'} onClick={()=>dispatch(uiActions.setUserTab('quizzes'))}>Quizzes Created</a>
			{ showTakenTab && <a className={tab === 'results' ? 'tab active' : 'tab'} onClick={()=>dispatch(uiActions.setUserTab('results'))}>Quizzes Taken</a> }
		</div>
		{ showTakenTab && tab === 'results' &&
		(<ul className={styles.quizList}>
			{ !loaderData.user.extra.showTaken &&
			(<ul className={styles.note}><strong>Note:</strong> This information is not shown to other people per account settings</ul>) }
			{ results.length ?
				results.map((item, i) => (
					<QuizResultItem key={i} item={item}/>
				)) :
				(<li className={styles.empty}>Nothing to display.</li>)
			}
		</ul>)}
		{ tab === 'quizzes' && (
		<ul className={styles.quizList}>
			{ quizzes.length ?
				quizzes.map((item, i) => (
					<QuizItem key={i} item={item} onDelete={showingThisUser && deleteQuiz} />
				)) :
				(<li className={styles.empty}>{showingThisUser ?
					<Link className="button" to="/quiz"><Icon icon="add"/>Create my first quiz</Link> :
					"Nothing to display."}</li>)
			}
		</ul>)}
	</article>)
}