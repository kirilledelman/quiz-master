import ExpandableArea from "./ExpandableArea.jsx";
import QuizSummaryBreakdownItem from "./QuizSummaryBreakdownItem.jsx";
import styles from './QuizCompletedSummary.module.scss'

export default function QuizCompletedSummary ({ summary, showCorrect, children }) {

	if (!summary) return (<></>);

	// determine rating
	const rating = summary.percent >= 100 ? 3 : summary.percent >= 75 ? 2 : summary.percent > 25 ? 1 : 0;

	return (<summary className={styles.QuizCompletedSummary}>
		<div className={styles.result}>
			<h2>{["Try again!", "Good!", "Great!", "Excellent!"][rating]}</h2>
			<h3 className={styles.percent + ' ' + styles[(['bad','ok','great','excellent'][rating])] }>{summary.percent}%</h3>
		</div>

		<h4>{summary.correctAnswers} correct {summary.partialAnswers > 0 && `and ${summary.partialAnswers} partially correct` } out of {summary.totalQuestions} total.</h4>

		<div className={styles.children}>
			{children}
		</div>

		{showCorrect &&
		(<ExpandableArea title="Breakdown">
			<ol>
			{summary.breakdown?.map((item, index) => <QuizSummaryBreakdownItem item={item} key={index} />)}
			</ol>
		</ExpandableArea>)}

	</summary>)
}