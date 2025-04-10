import styles from './QuizEditQuestion.module.scss'
import InputField from "./InputField.jsx"
import ErrorMessage from "./ErrorMessage.jsx"
import Icon from "./Icon.jsx"
import { useCallback } from "react"

/*
	Component for editing a single quiz question
*/

export default function QuizEditQuestion({ question, onChange, endCap, textError='', choicesError='' }) {
	const valueChanged = useCallback(function (event) {
		question[event.target.name] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
		onChange(question);
	}, [question, onChange]);

	const typeChanged = useCallback(function (event) {
		question.type = event.target.value;
		// if single choice, make sure only one is correct
		if ( question.type === 'choice') {
			let foundCorrect = false;
			question.choices.forEach((choice) => {
				if ( !choice.correct) return;
				if ( foundCorrect ) choice.correct = false;
				foundCorrect = true;
			});
		}
		onChange(question);
	}, [question, onChange]);

	const addChoice = useCallback(() => {
		question.choices.push({text: "New choice", correct: false });
		onChange(question);
	},[question, onChange]);

	const deleteChoice = useCallback((e, nth) => {
		// make a different one "correct" if multiple choice
		if ( question.type === 'choice' && question.choices[nth].correct ) {
			question.choices[ nth > 0 ? nth - 1 : nth + 1 ].correct = true;
		}
		question.choices.splice(nth, 1);
		onChange(question);
	},[question, onChange]);

	const moveChoice = useCallback((e, nth, dir) => {
		const other = question.choices[nth];
		question.choices[nth] = question.choices[nth + dir];
		question.choices[nth + dir] = other;
		onChange(question);
	},[question, onChange]);

	const setCorrect = useCallback((e, nth) => {
		if ( question.type === 'choice' ) {
			question.choices.map(((c, i) => c.correct = i === nth ));
		} else if ( question.type === 'multiple' ) {
			question.choices[nth].correct = e.target.checked;
		}
		onChange(question);
	},[question, onChange]);

	const choiceChanged = useCallback((e, nth) => {
		question.choices[nth].text = e.target.value;
		onChange(question);
	},[question, onChange]);

	const labelText = question.type === 'start' ? "Intro text" :
		( question.type === 'end' ? "Summary text" : "Question text" );

	return (<>
		<InputField name="title" label="Header" placeholder="Optional" thin value={question.title} onChange={valueChanged}/>
		<InputField name="text" label={labelText} type="textarea" value={question.text} onChange={valueChanged} error={textError}/>
		{ question.type === 'start' && (
			<InputField reverseLabel name="showIntro" label="Show intro" type="checkbox" value={!!question.showIntro} onChange={valueChanged}/>
		)}
		{ question.type === 'end' && (
			<InputField reverseLabel name="showCorrect" label="Show summary with correct answers" type="checkbox" value={!!question.showCorrect} onChange={valueChanged}/>
		)}
		{ !endCap && (<>
			<InputField name="type" type="select" label="Type" value={question.type} thin onChange={typeChanged}
			            postField={ (question.type === 'choice' || question.type === 'multiple' ) && (<button className="small" type="button" onClick={addChoice}><Icon icon="add" mode="tiny"/> Choice</button>) }>
				<option value="text">Text</option>
				<option value="choice">One Answer</option>
				<option value="multiple">Multiple Answers</option>
			</InputField>
			{ question.type === 'multiple' && (
				<InputField reverseLabel name="partial" label="Accept partially correct answer" thin type="checkbox" value={!!question.partial} onChange={valueChanged}/>
			) }
			{ (question.type === "choice" || question.type === 'multiple') &&
			(<ul className={styles.choices}>
				{ choicesError && <ErrorMessage>{choicesError}</ErrorMessage> }
				{ question.choices.map( (choice, index) =>{
					return (<li key={index}>
						<InputField value={choice.text} key={index} onChange={e => choiceChanged(e, index)}
						            preField={<InputField thin type={question.type === 'choice' ? 'radio' : 'checkbox'} value={choice.correct} onChange={e => setCorrect(e, index)}/>}
						            postField={<div className={styles.choiceButtons}>
							            <button className="small" type="button" tabIndex="-1" disabled={index === question.choices.length - 1} onClick={e => moveChoice(e, index, 1)}><Icon icon="down" mode="tiny"/></button>
							            <button className="small" type="button" tabIndex="-1" disabled={!index} onClick={e => moveChoice(e, index, -1)}><Icon icon="up" mode="tiny"/></button>
							            <button className="small" type="button" tabIndex="-1" disabled={question.choices < 2} onClick={e => deleteChoice(e, index)}><Icon icon="minus" mode="tiny"/></button>
						            </div>} />
					</li>)
				})}
			</ul>) }
		</>)}
	</>)
}