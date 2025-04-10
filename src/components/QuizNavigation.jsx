import styles from './QuizNavigation.module.scss'

/*
	Navigation and progress shown on top of a quiz
 */

export default function QuizNavigation({ edit, currentQuestion, onQuestionClicked, currentProgress=0, totalQuestions=0, skipIntro=false }) {
	const stepsButtons = [], // Start 1 2 ... Finish
		classNames = styles.QuizNavigation + ' ' + (edit ? styles.edit : ''),
	    quizFinished = !edit && currentProgress === totalQuestions - 1;

	// output buttons
	for( let i= skipIntro ? 1 : 0; i < totalQuestions; i++ ){
		const buttonText = i === 0 ? "Start" : (i === totalQuestions - 1 ? "Finish" : i.toString() ),
			classNames = (i === currentQuestion ? styles.current : '' ) + ' ' + (i < currentProgress ? styles.completed : ''),
			disabled = !edit && (i > currentProgress);

		stepsButtons.push(<button type="button" className={classNames} disabled={disabled || (quizFinished && i < totalQuestions - 1)} key={i} onClick={()=>onQuestionClicked(i) }>{ buttonText }</button>);

		// spacers between buttons
		if ( !edit && i < totalQuestions - 1 ) {
			stepsButtons.push(<span key={'s'+i} className={styles.spacer + ' ' + (i < currentProgress ? styles.completed : '')}>
				<span className={styles.fill}></span>
			</span>);
		}
	}

	return (<div className={classNames}>
		<div className={styles.innerBorder}></div>
		{ stepsButtons }
	</div>)
}