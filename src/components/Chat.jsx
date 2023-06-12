import React, { useState } from "react";
import { Paper, Stack, createStyles } from "@mui/material";

const Chat = (props) => {
    const [value, setValue] = useState("");
    return (
        <div>
            <div>
                <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter your message" />
                <button onClick={() => props.onClick(value)}>Send</button>
            </div>
        </div>
    )
}

export default Chat