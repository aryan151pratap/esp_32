import React, { useState, useEffect, useRef } from "react";

const OutputDisplay = ({give_scroll}) => {
    const [output, setOutput] = useState([]);
	give_scroll(output);

    useEffect(() => {
        const ws = new WebSocket("https://esp-32-igyl.onrender.com"); 

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setOutput((prevOutput) => [...prevOutput, data.output]); 
        };

        return () => ws.close();
    }, []);

    return (
		<>
		{output.length !== 0 ?
			<div className="w-full h-full flex flex-col p-2">
				<h2 className="px-4 text-green-500 text-[12px]"><span className="text-red-500">Live ESP32 Output</span></h2>
				<br/>
				<div className="px-4 flex-grow text-zinc-350 text-[15px] font-thin">
					{output.map((line, index) => (
						<p key={index} className={`${line.split(":")[0] === "Executing file" && "text-green-500"} `}>{line}</p>
					))}
				</div>
				<div className="flex text-sm font-thin tracking-wide">
					<button className="px-2 p-[1px] bg-zinc-700 ml-auto hover:bg-zinc-800/80"
					onClick={() =>{setOutput([])}}
					>Clear Output</button>
				</div>
			</div>
			:
			<div className="w-full h-full flex p-4 items-center justify-center">
				<h1 className="text-zinc-400 [word-spacing:8px]">No output yet. . .</h1>
			</div>
		}
		</>
    );
};

export default OutputDisplay;
