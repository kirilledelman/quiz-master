import styles from './QuizSummaryBreakdownItem.module.scss';
import Icon from "./Icon.jsx";
export default function QuizSummaryBreakdownItem({ item }) {
	const isPartial = (item.partial && item.points > 0 && (item.points < item.totalPoints || item.penaltyPoints > 0) );
	const isCorrect = (item.points === item.totalPoints);
	const icon = <Icon mode="tiny" icon={isPartial ? "half-star" : (isCorrect ? "star" : "empty-star")}/>;
	const answerClassname = isPartial ? styles.partial : (isCorrect ? styles.correct : styles.incorrect);
	return (<li className={styles.QuizSummaryBreakdownItem}>
		<div className={styles.inner}>
			<h4>{item.text}<span className={`${styles.icon} ${answerClassname}`}>{icon}</span></h4>
			{ (isCorrect && !isPartial) ? <div><strong className={styles.correct}>{item.userAnswers.join(", ")}</strong></div> :
				(<><div>
					<label>Correct answer:</label><strong className={styles.correct}>{item.correctAnswers.join(", ")}</strong>
				</div>
				<div>
					<label>You answered:</label>
					<strong className={answerClassname}>{ item.userAnswers.join(", ") }</strong>
				</div></>)
			}
		</div>
	</li>);
}