import React from "react";

const ActionButton = ({title, action, disabled=false}) => (
  <div className="r-c-c button bluebutton" onClick={action}>
    <div>
      {title} 
    </div>
  </div>
)

export default ActionButton;