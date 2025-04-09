import styles from './StatsResultItem.module.scss';
import { Link } from "react-router-dom";
import { formatTimestamp } from "../util/common.js";

export default function StatsResultItem ({ item }) {

	const rating = item.result >= 100 ? 3 : item.result >= 75 ? 2 : item.result > 25 ? 1 : 0,
		ratingClassName = styles[(['bad','ok','great','excellent'][rating])];

	return (<ul className={styles.StatsResultItem}>
		<div className={styles.time}>
			{formatTimestamp(item.timestamp)}
		</div>
		<div className={styles.user}>
			{item.userId ? <Link to={`/user/${item.userId}`}>{item.username}</Link> : "anonymous user" }
		</div>
		<div className={styles.score}>
			<strong className={ratingClassName}>{item.result}%</strong>
		</div>
		<div className={styles.rating}>
			{ item.rating > 0 && (<span>Rated <strong>{item.rating}</strong>/5</span>) }
		</div>
	</ul>);
}