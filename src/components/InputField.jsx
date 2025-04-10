import styles from './InputField.module.scss'
import { useRef } from "react"

/*
	General form input field used throughout the site
*/

export default function InputField({ name, label, type='text', error, value, onChange, reverseLabel, clearButton,
	                                   children, thin=false, nopad=false, preField=null, postField=null, ...rest }) {
	const ref = useRef(),
			rowStyles = [ styles.row, thin && styles.thin, nopad && styles.nopad, error && styles.error, label && styles.hasLabel, reverseLabel && styles.reversed, clearButton && styles.clearButton ].filter(Boolean),
			val = onChange ? value : undefined,
			defVal = onChange ? undefined : value;
	function clearField() {
		ref.current.value = "";
		if ( onChange ) onChange(null);
	}

	return (<div className={rowStyles.join(' ')}>
		{label && (<label htmlFor={name}>{label}</label>)}
		<div className={styles.wrapper}>
			{ preField }
			{ type === 'textarea' ?
				(<textarea ref={ref} id={name} name={name} onChange={onChange} value={val} defaultValue={defVal} {...rest}/>) :
				( type === 'select' ?
					( <select ref={ref} id={name} name={name} value={val} defaultValue={defVal} onChange={onChange} {...rest}>{children}</select>) :
					(<input ref={ref} id={name} name={name} type={type} checked={val} value={val} defaultChecked={defVal} defaultValue={defVal} onChange={onChange} {...rest} />)) }
			{ clearButton && type === 'text' && (<button className={`small ${styles.clear}`} onClick={clearField}>&#x2715;</button>) }
			{ postField }
			{ !thin && <span className={styles.wrap}/> }
			{error && <div className={styles.error}>{error}</div>}
		</div>
	</div>)
}