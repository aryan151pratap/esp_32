import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import OutputDisplay from "./output";

const Cmd = function({serverUrl}) {
    const [cmd, setcmd] = useState([]);
    const [output_scroll, setOutput_scroll] = useState([]);
    const [input, setInput] = useState("");
    const [yes, no] = useState(true);
    const [connect, setconnect] = useState("Error: Unable to connect to server. . . .");
	const [cmd_line, text_file] = useState(true);
    const [boot, setboot] = useState("");
    const [output, setOutput] = useState(false);

    const scrollRef = useRef(null);
    const outputScrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        if (outputScrollRef.current) {
            outputScrollRef.current.scrollTop = outputScrollRef.current.scrollHeight;
        }
    }, [cmd, output_scroll]);

    function handle_scroll(value){
        setOutput_scroll(value);
    }


    const fetchData = () => {
        axios.get(serverUrl, {
            headers: {
                "ngrok-skip-browser-warning": "true" 
            }
        })
        .then((response) => {
            console.log("Response:", response.data);
            setconnect(response.data.message);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            setconnect("Error: Unable to connect to server. . . .");
        });
    };
    
    

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [serverUrl]);  

    const sendCommandToServer = (command) => {
        axios.post(`${serverUrl}/send-command`, { command })
          .then((response) => {
            console.log("data", response.data.message);
            command = command.split("\n").map((i) => "→ " + i);
            setcmd((prevCmds) => [...prevCmds, command, response.data.message]);
          })
          .catch((error) => {
            console.error('Error sending command:', error);
            setcmd((prevCmds) => [...prevCmds, "→ " + command, "Error: " + error.message]);
          });
    };


    useEffect(() => {
        console.log("Updated cmd:", cmd);
    }, [cmd]); // Logs only when cmd changes
    

    function form(e) {
        e.preventDefault();
        if(connect.split(":") === "Error"){

        }
        else if (input.trim() === "clear" || input.trim() === "cls") {
            setcmd([]);
        }
        else if (input.trim() === "exit") {
            no(false);
            setcmd([]);
        }
        else if (input.trim() !== "") {
            sendCommandToServer(input); 
        }
        setInput("");
    }

    const handle = function(e) {
        setInput(e.target.value);
    }

    const handleTab = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault(); // Prevent the default action (moving to the next input)
            const cursorPos = e.target.selectionStart;
            const textBefore = input.substring(0, cursorPos);
            const textAfter = input.substring(cursorPos);
            setInput(textBefore + '\t' + textAfter); // Insert tab at cursor position
            e.target.selectionStart = e.target.selectionEnd = cursorPos + 1; // Update cursor position
        }
    }

    function copytoboot(e){
        e.preventDefault();
        console.log(boot);
        let command =  `with open('${boot}', 'r') as file:
    data = file.read() 
with open('boot.py', 'w') as file:
    file.write(data) `
        if (boot.trim() !== "") {
            sendCommandToServer(command); 
        }
        setboot("");
    }

    return (
        <>
        <div className='bg-zinc-500 text-white border-white border-y-[1px]'>
            <div className="flex gap-x-[1px] overflow-x-auto">
                <button className={yes && `px-2 bg-zinc-900` || 'px-2 bg-zinc-700'} onClick={(e) => { yes ? no(false) : no(true)}}>Terminal</button>
                <button className={'px-2 bg-zinc-700 hover:bg-zinc-800 '} onClick={fetchData}>
                <span className="overflow-hidden inline">Fetch Data</span></button>
                <button className={!cmd_line && `px-2 bg-zinc-900` || 'px-2 bg-zinc-700'} onClick={(e) => { cmd_line ? text_file(false) : text_file(true)}}>{cmd_line ? "file" : "command"}</button>
                <form action="" className="flex bg-zinc-80 p-[2px]" onSubmit={copytoboot}>
                    <input type="text" value={boot} onChange={(e) => {setboot(e.target.value)}} className="w-[120px] bg-zinc-800/80 outline-none px-2 text-[12px]" placeholder="Enter File Name . . ."/>
                    <button className={`hover:bg-zinc-900 px-2 bg-zinc-700 text-sm`} onClick={copytoboot}>Copy to Boot</button>
                </form>
                <button className={output ? `px-2 bg-zinc-900` : `px-2 bg-zinc-700`}
                onClick={() => {setOutput(!output)}}
                >
                    Output
                </button>
            </div>

            {yes && (
                <>
                    <div className="px-2 bg-zinc-800 text-zinc-400/50">
                        <label htmlFor="">{connect}</label>
                    </div>
                    <div className="flex w-full h-[200px] justify-between [word-spacing:4px]">
                    <div ref={scrollRef} className="w-full h-full flex flex-col bg-zinc-900/90 p-2 outline-none overflow-y-auto text-sm">
                        {cmd.map((items, j) => {
                            return(
                                <p key={j}>    
                                    {Array.isArray(items) && items.map((item, i) => {
                                        console.log(item, i); 
                                        return ( 
                                            <div key={i}>
                                                {item.split(" ")[0] === "→" ?
                                                    <label className="tracking-wide block text-zinc-200">
                                                        {item || "\u00A0"}
                                                    </label> : item.split(":")[0] === "Error" ?
                                                    <label className="tracking-wide block text-red-500">
                                                        {item || "\u00A0"}
                                                    </label> :
                                                    <label className="tracking-wide block text-green-500">
                                                        {item || "\u00A0"}
                                                    </label>
                                                } 
                                            </div>
                                        );
                                    })}
                                </p>
                            )
                        })}
                    </div>
                    {output &&
                    <div ref={outputScrollRef} className="w-[100%] h-full bg-zinc-900 overflow-y-auto">
                        <OutputDisplay give_scroll={handle_scroll} serverUrl={serverUrl}/>
                    </div>
                    }
                    </div>
                    <div className="w-full">
                        <form onSubmit={form}>
							{cmd_line ? 
							<input 
								type="text" 
								placeholder="command..." 
								value={input} 
								onChange={handle} 
								className="tracking-wide w-full h-4 p-4 bg-zinc-900 outline-none"
								spellCheck={false} 
                            /> 
							:
							<div className="h-full w-full bg-zinc-500 flex flex-col">
								<textarea 
									type="text" 
									placeholder="code..." 
									value={input} 
									onChange={handle} 
									onKeyDown={handleTab} // Add onKeyDown event handler
									className="tracking-wide h-[300px] resize-none w-full p-4 bg-zinc-900 outline-none"
									spellCheck={false} 
								></textarea>
								<button type="submit" className="bg-zinc-700 rounded-md hover:bg-zinc-800 p-2">Run Code</button>
							</div>
							}
                        </form>
                    </div>
                </>
            )}
        </div>
        </>
    );
}

export default Cmd;
