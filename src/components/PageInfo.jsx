import styles from "./PageInfo.module.scss"
import Icon from "./Icon.jsx"
import { useState } from "react"

/*
	Icon button + unfoldable area used in page titles for page notes
*/

export default function PageInfo({children}) {
	const [expanded, setExpanded] = useState(false);

	return (<>
		<Icon title="About this page..." className={styles.icon} mode="small" icon="info" onClick={() => setExpanded(!expanded)}/>
		<span className={styles.wrap}/>
		<aside className={`${styles.content} ${(expanded ? styles.expanded : styles.collapsed)}`}>
			{ children }
		</aside>
	</>)
}