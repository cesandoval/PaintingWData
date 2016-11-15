import React from 'react';

export default (props) => (
    <div className="optionsButton" onClick={props.onClick}>
        <div className={(!props.down) ? "arrow-down" : "arrow-up"} />
    </div>
)
