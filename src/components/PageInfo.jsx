import { useState } from "react";
import styles from "./PageInfo.module.scss";
import Icon from "./Icon.jsx";

export default function PageInfo({children, tooltip="About this page"}) {
	const [expanded, setExpanded] = useState(false);

	return (<>
		<Icon title={tooltip} className={styles.PageInfo} mode="small" icon="info" onClick={() => setExpanded(!expanded)}/><span className={styles.wrap}/>
		<aside className={`${styles.content} ${(expanded ? styles.expanded : styles.collapsed)}`}>
			{ children }
		</aside>
	</>)
}