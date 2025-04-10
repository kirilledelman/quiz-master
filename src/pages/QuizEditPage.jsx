import styles from "./QuizEditPage.module.scss"
import { backendUrl, getAuthHeader } from "../util/common"
import { uiActions } from "../store/ui"
import QuizNavigation from "../components/QuizNavigation"
import useUnsavedChanges from "../hooks/useUnsavedChanges"
import InputField from "../components/InputField.jsx"
import ErrorMessage from "../components/ErrorMessage.jsx"
import QuizEditQuestion from "../components/QuizEditQuestion.jsx"
import PageInfo from "../components/PageInfo.jsx"
import Icon from "../components/Icon.jsx"
import { redirect, useLoaderData, useLocation, useNavigate } from "react-router-dom"
import { useActionState, useCallback, useEffect, useState } from "react"
import { useDispatch } from "react-redux"

/*
	Edit quiz page
*/

// quiz object loader used by this and quiz taking page
export async function quizLoader({ request, params }) {
	// if not logged in and trying to load in edit mode, redirect to log in
	if ( request.url.endsWith('/quiz')) {
		if ( !localStorage.getItem('auth')) return redirect('/user/login?logged-out');
		return null;
	}

	// quizId route
	const response = await fetch(`${backendUrl}/quiz/${params.quizId}`, {
		method: 'GET', headers: getAuthHeader()
	});

	// auth failed
	if ( response.status === 401 ) return redirect('/user/login?logged-out');
	if ( !response.ok ) throw response;
	return response;
}

// returns a fresh empty quiz object
function newQuizObject() {
	return {
		id: 0,
		published: false,
		title: "Untitled Quiz",
		data: {
			questions: [
				{type: 'start', title: "", showIntro: true, text: 'Welcome to the quiz!'},
				{type: 'end', title: "", showCorrect: false, text: 'Thank you for taking the quiz!'}],
		}
	}
}

export default function QuizEditPage() {
	const dispatch = useDispatch(),
		loaderData = useLoaderData(),
		navigate = useNavigate(), location = useLocation(),
		[isDirty, setDirty, setClean] = useUnsavedChanges("You have unsaved changes. Are you sure you want to navigate away from this page?"),
		[quiz, setQuiz] = useState(loaderData || newQuizObject() ),
		[currentQuestion, setCurrentQuestion] = useState(location.state?.currentQuestion || 0),
		[validation, formActionFunc, pending] = useActionState(saveQuiz, {}); // quiz object from loader

	// resync quiz state and loaderData on change
	useEffect(() => {
		// came back after initial save from new quiz page
		if ( loaderData && loaderData.id !== quiz.id ) {
			setQuiz(loaderData);
		// navigated to new quiz after editing another
		} else if ( !loaderData && quiz.id ) {
			setQuiz(newQuizObject());
		}
	}, [loaderData, quiz.id ]);

	// form action function, returns
	async function saveQuiz() {
		// validate
		const validation = {};
		let numQuestions = 0;
		if (!quiz.title.length) validation.title = "Title can't be blank";
		if ( quiz.published && !quiz.data.questions.find(q => ['choice','multiple'].includes(q.type))) validation.form = "Can't publish quiz with no questions";
		// check each question
		for ( let i = 0; i < quiz.data.questions.length; i++ ) {
			const question = quiz.data.questions[i];
			const isQuestion = ['choice','multiple'].includes(question.type);
			numQuestions += isQuestion;
			if ( !question.text.trim().length ) {
				validation.textError = "Question can't be blank";
				validation.errorQuestion = i;
				break;
			}
			if ( isQuestion && !question.choices.reduce((nc, choice)=>nc + choice.correct, 0)) {
				validation.choicesError = "At least one choice must be checked";
				validation.errorQuestion = i;
				break;
			}
		}
		// had errors
		if ( Object.keys(validation).length ) {
			// jump to problem question
			if (validation.errorQuestion)
				setCurrentQuestion(validation.errorQuestion);
			// select input bug in React
			setTimeout(()=> {
				setQuiz({...quiz});
				dispatch(uiActions.showNotification("Quiz had some problems, fix to save."));
			},1);
			return validation;
		}

		// POST to /quiz if new quiz, or PATCH /quiz/:quizId if existing
		let url = `${backendUrl}/quiz`, method = 'POST';
		if (quiz.id) {
			url += `/${quiz.id}`;
			method = 'PATCH';
		}

		// save number of questions
		quiz.size = numQuestions;

		// send
		const response = await fetch(url, { method, body: JSON.stringify(quiz), headers: getAuthHeader() });
		setClean();
		if ( !response.ok ) {
			switch ( response.status ) {
				case 401: navigate('/user/login?logged-out'); return validation;
				default: throw response;
			}
		}

		// update id
		const result = await response.json();
		setQuiz({id: result.quizId, ...quiz});
		dispatch(uiActions.showNotification("Quiz saved."));

		// if this was a new quiz, redirect to edit page
		if ( !quiz.id ) {
			navigate(`/quiz/${result.quizId}/edit`, { state: { currentQuestion } });
		} else {
			// React forms select box bug causes <select> to revert to default value after form submit, so force repaint
			setTimeout(()=>setQuiz({...quiz}), 1 );
		}
		return validation;
	}

	// questions operations
	const numQuestions = quiz.data.questions.length,
		endCapQuestion = (currentQuestion === 0 || currentQuestion === numQuestions - 1);

	const titleChanged = useCallback((e)=> {
		quiz.title = e.target.value;
		setQuiz({...quiz});
		setDirty();
		validation.title = false; // clear error
	}, [quiz, setDirty, validation]);

	const publishedChanged = useCallback((e) => {
		quiz.published = e.target.checked;
		setQuiz({...quiz});
		setDirty();
	}, [quiz, setDirty]);

	const addQuestion = useCallback( function() {
		const question = {
			title: "",
			type: "choice",
			text: "Question text",
			choices: [
				{text: "Possible answer A", correct: false },
				{text: "Possible answer B", correct: true } ]
		}
		// insert new question
		const insertAt = currentQuestion < numQuestions - 1 ? currentQuestion + 1 : currentQuestion - 1;
		quiz.data.questions.splice(insertAt, 0, question);
		setCurrentQuestion(insertAt);
		setQuiz({...quiz});
		setDirty();
	}, [currentQuestion, quiz, numQuestions, setDirty, setQuiz] );

	const deleteQuestion = useCallback( function() {
		if ( endCapQuestion || !confirm("Are you sure you want to delete this question?")) return;
		quiz.data.questions.splice(currentQuestion, 1);
		// setCurrentQuestion(currentQuestion + 1);
		setQuiz({...quiz});
		setDirty();
	}, [currentQuestion, endCapQuestion, quiz, setDirty]);

	const questionChanged = useCallback( function(question) {
		quiz.data.questions[currentQuestion] = question;
		setQuiz({...quiz});
		setDirty();
		validation.textError = false;
	},[quiz, setDirty, currentQuestion, validation]);

	const moveQuestion = useCallback( function(dir) {
		if ( endCapQuestion ) return;
		const thisQuestion = quiz.data.questions[currentQuestion];
		quiz.data.questions[currentQuestion] = quiz.data.questions[currentQuestion + dir];
		quiz.data.questions[currentQuestion + dir] = thisQuestion;
		setCurrentQuestion(currentQuestion + dir);
		setQuiz({...quiz});
		setDirty();
	}, [currentQuestion, endCapQuestion, quiz, setDirty]);

	return (<article className={styles.QuizEditPage}>
	<h2>{quiz.id === 0 ? 'Create Quiz' : 'Edit Quiz'}
	<PageInfo>
		This page uses components to facilitate editing a nested data object, and custom hook to prevent
		unsaved changes navigation.
	</PageInfo>
	</h2>

	<form action={formActionFunc} className="box">
		<InputField name="title" label="Title" value={quiz.title} thin onChange={titleChanged} error={validation.title} />
		<InputField name="published" label="Published" reverseLabel type="checkbox" value={quiz.published} onChange={publishedChanged}/>

		<div className={styles.questionButtons}>
			<button className="small" type="button" onClick={addQuestion}><Icon icon="add" mode="small"/> Question</button>
			<button className="small" type="button" onClick={()=>moveQuestion(-1)} disabled={endCapQuestion || currentQuestion === 1 }><Icon icon="left" mode="small"/> Move</button>
			<button className="small" type="button" onClick={()=>moveQuestion(1)} disabled={endCapQuestion || currentQuestion === numQuestions - 2 }>Move <Icon icon="right" mode="small"/></button>
			<button className="small" type="button" onClick={deleteQuestion} disabled={endCapQuestion}><Icon icon="minus" mode="small"/> Delete</button>
		</div>

		<QuizNavigation edit currentQuestion={currentQuestion} onQuestionClicked={setCurrentQuestion} totalQuestions={quiz.data.questions.length} />

		<QuizEditQuestion question={quiz.data.questions[currentQuestion]} onChange={questionChanged} endCap={endCapQuestion}
		                  textError={currentQuestion === validation.errorQuestion && validation.textError}
		                  choicesError={currentQuestion === validation.errorQuestion && validation.choicesError} />

		{ validation.form && <ErrorMessage>{validation.form}</ErrorMessage> }
		<button type="submit" disabled={!isDirty || pending}>Save Changes</button>
	</form>
	</article>);
};