import React, { useState, useRef, useEffect, useCallback } from "react";

const transformExpression = (expr) =>
  expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\^/g, "**")
    .replace(/π/g, "Math.PI")
    .replace(/e/g, "Math.E")
    .replace(/√\(/g, "Math.sqrt(")
    .replace(/sin\(/g, "Math.sin(")
    .replace(/cos\(/g, "Math.cos(")
    .replace(/tan\(/g, "Math.tan(")
    .replace(/log\(/g, "Math.log10(")
    .replace(/ln\(/g, "Math.log(")
    .replace(/(\d+)\^2/g, "Math.pow($1, 2)");

const BUTTON_GRID = [
  ["C", "(", ")", "DEL", "÷"],
  ["sin(", "cos(", "tan(", "log(", "×"],
  ["ln(", "e", "π", "^", "-"],
  ["7", "8", "9", "√(", "+"],
  ["4", "5", "6", "^2", "="],
  ["1", "2", "3", "0", "."],
];

const getButtonClass = (btn) => {
  if (["C", "DEL"].includes(btn)) return "calc-btn btn-clear";
  if (btn === "=") return "calc-btn btn-equals";
  if (["+", "-", "×", "÷", "^", "√(", "(", ")", "^2"].includes(btn))
    return "calc-btn btn-op";
  if (["sin(", "cos(", "tan(", "log(", "ln(", "e", "π"].includes(btn))
    return "calc-btn btn-sci";
  return "calc-btn btn-num";
};

const getButtonLabel = (btn) =>
  btn.length > 1 && btn.endsWith("(") ? btn.slice(0, -1) : btn;

const Calculator = () => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [isMinimized, setIsMinimized] = useState(false);
  const [triggerKeyEffect, setTriggerKeyEffect] = useState(null); 
  const [position, setPosition] = useState({ x: 50, y: 100 });

  const calculated = useRef(false);

  const dragData = useRef({ offsetX: 0, offsetY: 0, dragging: false });
  const containerRef = useRef(null); 

  const startDrag = (e) => {
    if (e.target.closest('button')) return; 
    dragData.current.dragging = true;
    dragData.current.offsetX = e.clientX - position.x;
    dragData.current.offsetY = e.clientY - position.y;
  };

  const stopDrag = () => {
    dragData.current.dragging = false;
  };

  const onDrag = (e) => {
    if (!dragData.current.dragging) return;
    let newX = e.clientX - dragData.current.offsetX;
    let newY = e.clientY - dragData.current.offsetY;

    setPosition({
      x: newX,
      y: newY,
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [onDrag]); 
  const calculateResult = () => {
    if (!expression) return;

    try {
      const evalExpr = transformExpression(expression);
      const evalResult = eval(evalExpr);
      const finalResult = Number(evalResult.toFixed(8)).toString();
      setResult(finalResult);
      setExpression(finalResult);
      calculated.current = true;
    } catch {
      setResult("Error");
      calculated.current = true;
    }
  };

  const handleButtonClick = useCallback(
    (value) => {
      setTriggerKeyEffect(value);
      setTimeout(() => setTriggerKeyEffect(null), 100); 

      if (calculated.current && !["=", "C", "DEL"].includes(value)) {
        const isOperator = ["+", "-", "×", "÷", "^", "%"].includes(value);
        setExpression(isOperator ? result + value : value);
        setResult(value);
        calculated.current = false;
        return;
      }

      if (value === "C") {
        setExpression("");
        setResult("0");
        calculated.current = false;
      } else if (value === "=") {
        calculateResult();
      } else if (value === "DEL") {
        setExpression((prev) => prev.slice(0, -1));
      } else {
        setExpression((prev) => prev + value);
      }
    },
    [result, expression] 
  );

  useEffect(() => {
    const map = {
      "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
      "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
      ".": ".", "+": "+", "-": "-", "*": "×", "/": "÷",
      "^": "^", "(": "(", ")": ")",
      Enter: "=", "=": "=",
      Backspace: "DEL", Escape: "C",
    };

    const onKeyDown = (e) => {
      const val = map[e.key];
      if (!val) return;
      e.preventDefault();
      handleButtonClick(val);
    };
    
    const onKeyUp = () => setTriggerKeyEffect(null);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handleButtonClick]);

  if (isMinimized) {
    return (
      <div
        className="calc-minimized"
        onMouseDown={startDrag}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          zIndex: 2147483647, 
        }}
      >
        <span>⚛ Sci Calc</span>
        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false)}}>↗</button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="calc-container"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex: 2147483647,
      }}
    >
      <div className="calc-header" onMouseDown={startDrag}>
        <div className="calc-title">
          <span>⚛</span> Scientific Calculator
        </div>

        <div className="calc-controls">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true)}}>_</button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpression("");
              setResult("0");
              setPosition({ x: 50, y: 100 });
            }}
          >
            ↻
          </button>
        </div>
      </div>

      <div className="calc-display">
        <div className="calc-expression">{expression || "\u00A0"}</div>
        <div className="calc-result">{result}</div>
      </div>

      <div className="calc-grid">
        {BUTTON_GRID.flat().map((btn, index) => {
          const isPressed = triggerKeyEffect === btn;

          return (
            <button
              key={btn + index}
              onClick={() => handleButtonClick(btn)}
              className={`${getButtonClass(btn)} ${
                isPressed ? "btn-pressed" : ""
              }`}
              style={
                btn === "="
                  ? {
                      gridColumn: "span 1",
                      gridRow: "span 2",
                      height: "100%",
                    }
                  : {}
              }
            >
              {getButtonLabel(btn)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calculator;