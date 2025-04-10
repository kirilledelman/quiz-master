import styles from "./Notification.module.scss"
import Icon from "./Icon.jsx"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {uiActions} from "../store/ui.js"

/*
	Pop-up notification shown at the bottom of the screen
*/


// default notification duration
const showDuration = 3000;

export default function Notification() {
	const dispatch = useDispatch(),
		text = useSelector((state) => state.ui.notificationText),
		counter = useSelector((state) => state.ui.notificationCounter),
		[show, setShow] = useState(false);

	// when text changes
	useEffect(() => {
		// hide if empty text
		if (!text) {
			setShow(false);
			return;
		}

		// show when new text, then hide after delay
		setShow(true);
		let hideInterval, interval = setInterval(() => {
			setShow(false);
			hideInterval = setInterval(() => {
				// clear text
				dispatch(uiActions.clearNotification());
			}, 1000);
		}, showDuration );

		// return cleanup func
		return ()=>{ clearInterval(interval); clearInterval(hideInterval) };
	}, [text, counter, dispatch]);

	return (
		<div className={styles.notification + ' ' + (show ? styles.show : '') }>
			<div className={styles.wrapper}>
				<Icon icon="info" mode="small"/> {text}
			</div>
		</div>
	)
}