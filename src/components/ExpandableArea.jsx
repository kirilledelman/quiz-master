import { useState } from "react";
import styles from "./ExpandableArea.module.scss";
import Icon from "./Icon.jsx";

export default function ExpandableArea({title, children}) {
	const [expanded, setExpanded] = useState(false);

	return (<div className={styles.ExpandableArea + ' ' + (expanded ? styles.expanded : styles.collapsed) }>
		<h4 className={styles.header} onClick={() => setExpanded(!expanded)}>
			<Icon icon={expanded ? 'down' : 'right' } mode="small"/>{title}
		</h4>
		<div className={styles.content}>
			{children}
		</div>
	</div>)
}