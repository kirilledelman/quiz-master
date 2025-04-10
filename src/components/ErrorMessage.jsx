import styles from './ErrorMessage.module.scss'
import Icon from "./Icon.jsx"

/*
Error message shown after clicking submit button on a form
*/

export default function ErrorMessage({children}) {
	if (!children) return null;

	return (<div className={styles.ErrorMessage}>
		<Icon icon="error" mode="small"/>
		{children}
	</div>);
}