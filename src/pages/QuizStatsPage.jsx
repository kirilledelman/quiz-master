import { backendUrl, formatTimestamp, getAuthHeader } from "../util/common.js";
import { Link, redirect, useLoaderData } from "react-router-dom";
import styles from "./QuizStatsPage.module.scss";
import StatsResultItem from "../components/StatsResultItem.jsx";

export async function statsLoader({params}) {
	const response = await fetch(`${backendUrl}/results/${params.quizId}`,
		{ method: 'GET', headers: getAuthHeader() });

	// auth failed
	if ( response.status === 401 ) return redirect('/user/login?logged-out');
	if ( !response.ok ) throw response;
	return response;
}

export default function QuizStatsPage() {
	const statsData = useLoaderData(),
		trunc = (value) => value.toFixed(1).replace(/\.?0*$/,'');
	statsData.stats = statsData.stats.sort((a, b) => b.timestamp - a.timestamp);

	// format rating
	const rating = statsData.rated > 0 ? trunc(statsData.rating / statsData.rated) : 0;
	// average score
	const avgScore = trunc(statsData.stats.reduce((total, item) => total + item.result, 0) / Math.max(1, statsData.stats.length));

	return (<article className={styles.QuizStatsPage}>
		<h2>Quiz Stats</h2>
		<div className={styles.card}>
			<h2 className={styles.title}>{statsData.title}</h2>
			<div className={styles.updated}>Updated {formatTimestamp(statsData.updated)}</div>
			<div className={styles.wrap}></div>
			<div className={styles.taken}>{statsData.stats.length ? `Taken ${statsData.stats.length} time${statsData.stats.length>1 ? 's':''}` : "No takers"}</div>
			<div className={styles.score}>Average score {avgScore}%</div>
			<div className={styles.rating}>{statsData.rated > 0 ? (<span><strong>{rating}</strong>/5 ({statsData.rated} rating{statsData.rated > 1 && 's'})</span>) : 'No ratings'}</div>
		</div>
		<div className={styles.results}>
			<h3>Results</h3>
			<ul>
				{ !statsData.stats.length && <li className={styles.empty}>Nothing to display.</li>}
				{ statsData.stats.map((item,i) => <StatsResultItem key={i} item={item}/>) }
			</ul>
		</div>
	</article>);
}