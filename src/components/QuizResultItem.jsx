import styles from './QuizResultItem.module.scss';
import { Link } from "react-router-dom";
import { formatTimestamp } from "../util/common.js";

export default function QuizResultItem ({ item }) {

	const rating = item.highestResult >= 100 ? 3 : item.highestResult >= 75 ? 2 : item.highestResult > 25 ? 1 : 0;

	return (<li className={styles.QuizResultItem}>
		<div className={styles.name}>
			<span><Link to={`/quiz/${item.quizId}`}>{item.quiz.title}</Link></span>
			<span>by <Link to={`/user/${item.quiz.ownerId}`}>{item.quiz.username}</Link></span>
		</div>
		<div className={styles.time}>
			<span>Taken {item.count > 1 && `${item.count} times`}</span>
			<span>{item.count > 1 && "last time"} {formatTimestamp(item.highestTimestamp)}</span>
		</div>
		<div className={styles.score}>
			<span className={styles[(['bad','ok','great','excellent'][rating])]}>{item.highestResult}%</span>
			<span>{ item.count > 1 && "best"} score</span>
		</div>
	</li>);
}