import styles from './QuizQuestion.module.scss'
import InputField from "./InputField.jsx"
import { useCallback } from "react"

/*
	Quiz question component displayed when taking a quiz
*/

export default function QuizQuestion({ question, answer, onChange }) {
	const setCorrect = useCallback((e, nth) => {
		// update answer with selected choice
		for (let i = 0; i < question.choices.length; i++) {
			answer[i] = question.type === 'choice' ? (nth === i) : (nth === i ? e.target.checked : answer[i]);
		}
		onChange(answer);
	},[question, answer, onChange]);

	return (<div className={styles.QuizQuestion}>
		<div className={styles.questionBody}>
			{question.title && (<h3>{question.title}</h3>)}
			<p>{question.text}</p>
		</div>

		{ (question.type === "choice" || question.type === 'multiple') &&
			(<ul className={styles.choices}>
				{ question.choices.map( (choice, index) =>{
					return (<li key={index}>
							<InputField reverseLabel thin nopad
							            type={question.type === 'choice' ? 'radio' : 'checkbox'}
							            value={answer[index] === true}
							            label={choice.text}
							            name={`c${index}`}
							            onChange={e => setCorrect(e, index)}/>
					</li>)
				})}
			</ul>) }

		<div className={styles.tip}>{ {
			multiple:"Check all that apply to continue",
			choice: "Select answer to continue" }[question.type] }</div>
	</div>);

}