export function useUndoRedo({ userRows, setUserRows, history, setHistory, redoStack, setRedoStack }) {
  const saveToHistory = (newUserRows) => {
    if (JSON.stringify(newUserRows) === JSON.stringify(userRows)) return;
    setHistory((prev) => [...prev.slice(-11), userRows]);
    setRedoStack([]);
    setUserRows(newUserRows);
  };

  const undo = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousState = newHistory.pop();
      setRedoStack([userRows, ...redoStack]);
      setUserRows(previousState);
      setHistory(newHistory);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.shift();
      setHistory([...history, userRows]);
      setUserRows(nextState);
      setRedoStack(newRedoStack);
    }
  };

  return { saveToHistory, undo, redo };
}
