import { useState } from "react";
import { useBeforeUnload, useBlocker } from "react-router-dom";

/*
custom hook for preventing navigating away from current location if dirty flag is set
returns [ isDirty, setDirty(), setClean() ]
*/

export default function useUnsavedChanges(prompt) {
	const [isDirty, setIsDirty] = useState(false);
	const handleBeforeUnload = (event) => {
		if (isDirty) {
			if ( event.preventDefault) { // beforeUnload event
				event.preventDefault();
				event.returnValue = prompt;
				return prompt;
			} else return !confirm(prompt); // blocker call
		}
		return false;
	};
	useBeforeUnload(handleBeforeUnload);
	useBlocker(handleBeforeUnload);
	return [ isDirty, ()=>{setIsDirty(true)}, ()=>{setIsDirty(false)} ];
}