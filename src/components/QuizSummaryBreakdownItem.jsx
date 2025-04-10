import styles from './QuizSummaryBreakdownItem.module.scss'
import Icon from "./Icon.jsx"

/*
	Item displayed in the summary breakdown section, showing user's answer and correct answer.
*/

export default function QuizSummaryBreakdownItem({ item }) {
	const isPartial = (item.partial && item.points > 0 && (item.points < item.totalPoints || item.penaltyPoints > 0) ),
		isCorrect = (item.points === item.totalPoints),
		answerClassname = isPartial ? styles.partial : (isCorrect ? styles.correct : styles.incorrect),
		icon = <Icon mode="tiny" icon={isPartial ? "half-star" : (isCorrect ? "star" : "empty-star")}/>;

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