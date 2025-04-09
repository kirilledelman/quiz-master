import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import QuizNavigation from "../components/QuizNavigation.jsx";
import useUnsavedChanges from "../hooks/useUnsavedChanges.jsx";
import QuizQuestion from "../components/QuizQuestion.jsx";
import QuizCompletedSummary from "../components/QuizCompletedSummary.jsx";
import { uiActions } from "../store/ui";
import styles from './QuizPage.module.scss';
import { backendUrl, getAuthHeader } from "../util/common.js";
import Icon from "../components/Icon.jsx";

export default function QuizPage() {
	const dispatch = useDispatch(),
		navigate = useNavigate(),
		user = useSelector( state => state.user.user),
		quiz = useLoaderData(),
		totalQuestions = quiz.data.questions.length,
		firstQuestion = quiz.data.questions[0].showIntro ? 0 : 1,
		[currentProgress, setCurrentProgress] = useState(firstQuestion),
		[currentQuestion, setCurrentQuestion] = useState(firstQuestion),
		[summary, setSummary] = useState(null),
		[resultId, setResultId] = useState(0),
		[rating, setRating] = useState(0),
		// prevent navigating away if any questions were answered
		[, setDirty, setClean] = useUnsavedChanges("If you navigate away from this page your progress will be lost. Do you want to abandon this quiz?"),
		// answers are initialized with []
		[answers, setAnswers] = useState(Array.from(quiz.data.questions).map(()=>[]));

	// calculate score, create summary, save result
	const quizFinished = useCallback(async ()=>{
		let _totalPoints = 0, _scoredPoints = 0, _totalPenalty = 0,
			_correctAnswers = 0, _partialAnswers = 0,
			_summary = [];
		quiz.data.questions.forEach((question, questionIndex) => {
			// skip non-questions
			if ( !['choice','multiple'].includes(question.type) ) return;

			// init summary item
			const answer = answers[questionIndex];
			const summaryItem = {
				text: question.text,
				points: 0, penaltyPoints: 0, partial: question.partial,
				totalPoints: 0,
				correctAnswers: [],
				userAnswers: [],
			};

			// sum up correct answers
			for ( let i in answer ) {
				if (answer[i]) {
					summaryItem.userAnswers.push(question.choices[i].text);
					if (question.choices[i].correct) summaryItem.points++;
					else if (question.type === 'multiple') summaryItem.penaltyPoints++;
				}
			}

			// sum up available points
			for ( let i in question.choices ) {
				if (question.choices[i].correct) {
					summaryItem.correctAnswers.push(question.choices[i].text);
					if (question.choices[i].correct) summaryItem.totalPoints++;
				}
			}

			// multiple answers
			if ( question.type === 'multiple' ) {
				// partially correct is accepted
				if ( question.partial ) {
					if (summaryItem.totalPoints === summaryItem.points && summaryItem.penaltyPoints === 0) _correctAnswers++;
					else if (summaryItem.points > 0) _partialAnswers++;
				}
				// partially correct not accepted
				else {
					if (summaryItem.totalPoints === summaryItem.points && summaryItem.penaltyPoints === 0) {
						_correctAnswers++;
						summaryItem.points = 1;
					} else {
						summaryItem.penaltyPoints = summaryItem.points = 0;
					}
					summaryItem.totalPoints = 1;
				}
			}
			// single choice question
			else {
				if (summaryItem.points) _correctAnswers++;
			}

			// add totals
			_totalPenalty += summaryItem.penaltyPoints;
			_totalPoints += summaryItem.totalPoints;
			_scoredPoints += summaryItem.points;
			_summary.push(summaryItem);
		});

		// save calculated values
		const result = {
			breakdown: _summary,
			percent: Math.round(100 * (_correctAnswers + 0.5 * _partialAnswers) / _summary.length ),
			totalPoints: _totalPoints, scoredPoints: _scoredPoints - _totalPenalty,
			totalQuestions: _summary.length, correctAnswers: _correctAnswers, partialAnswers: _partialAnswers
		};

		setSummary(result);
		const payload = { score: result.percent };
		const response = await fetch(`${backendUrl}/results/add/${quiz.id}`, {
			method: "POST", headers:  getAuthHeader(),
			body: JSON.stringify(payload),
		});
		const reply = await response.json();
		setResultId(reply.resultId);
	}, [quiz, answers]);

	// next/previous
	const go = useCallback( function (dir) {
		const newIndex = Math.max(firstQuestion, currentQuestion + dir);
		// past last one? go back to quizzes
		if (newIndex >= totalQuestions) {
			return navigate('/quizzes');
		} else if (newIndex === totalQuestions - 1) {
			setClean();
			quizFinished();
		}
		setCurrentQuestion(newIndex);
		setCurrentProgress(Math.max(newIndex, currentProgress));
	}, [currentQuestion, currentProgress, setCurrentProgress, setCurrentQuestion, totalQuestions, navigate, setClean, quizFinished, firstQuestion] );

	// update answers for current question
	const answerChanged = useCallback((answer)=>{
		answers[currentQuestion] = answer;
		setDirty();
		setAnswers([...answers]);
	}, [answers, setAnswers, currentQuestion, setDirty]);

	// flags for next/prev buttons
	const prevHidden = currentQuestion === firstQuestion || currentQuestion === totalQuestions - 1,
		nextDisabled = currentQuestion > 0 && currentQuestion < totalQuestions - 1 &&
			quiz.data.questions[currentQuestion].type !== 'text' && !answers[currentQuestion].includes(true);

	// share onClick function
	const tryShare = useCallback(async e => {
		e.preventDefault();
		try {
			await navigator.share({
				title: quiz.title,
				text: `I scored ${summary.percent}%`,
				url: window.location.toString() });
		} catch (err) {}
	}, [summary, quiz] );

	async function rateQuiz(r) {
		setRating(r);
		fetch(`${backendUrl}/quiz/rate/${quiz.id}`, {
			method: "POST", headers:  getAuthHeader(),
			body: JSON.stringify({ rating: r, resultId: resultId })
		});
		dispatch(uiActions.showNotification("Quiz rated!"));
	}

	return (<article className={styles.QuizPage}>
		<h2>{quiz.title}</h2>
		<QuizNavigation currentQuestion={currentQuestion} currentProgress={currentProgress} skipIntro={firstQuestion === 1}
		                onQuestionClicked={setCurrentQuestion} totalQuestions={totalQuestions} />

		<QuizQuestion question={quiz.data.questions[currentQuestion]} answer={answers[currentQuestion]} onChange={answerChanged}/>

		{ currentQuestion === totalQuestions - 1 &&
			(<QuizCompletedSummary summary={summary} showCorrect={quiz.data.questions[currentQuestion].showCorrect}>
				{ navigator.share && (<button onClick={tryShare}><Icon icon="share" mode="small"/>Share Result</button>) }
				{ user && resultId && user.id !== quiz.ownerId &&
					(<div className={styles.rateQuiz}>
						<h4>Rate this quiz</h4>
						{[1,2,3,4,5].map(i => (
							<button key={i} className={rating >= i ? styles.selected : undefined } onClick={()=>rateQuiz(i)}>{i}</button>
						))}
					</div> )}
			</QuizCompletedSummary> )}

		<div className={styles.prevNext}>
			<button hidden={prevHidden} onClick={()=>go(-1)}><Icon icon="back" mode="small"/>Previous</button>
			<span>
				{ currentQuestion > 0 && currentQuestion < totalQuestions - 1 && (`${currentQuestion} of ${totalQuestions - 2}`) }
			</span>
			<button disabled={nextDisabled} onClick={()=>go(1)}>{ currentQuestion < totalQuestions - 1 ? 'Next' : 'Return to Quizzes' }<Icon icon="forward" mode="small"/></button>
		</div>
	</article>)
}