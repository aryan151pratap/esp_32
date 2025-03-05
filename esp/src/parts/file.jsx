import { useState, useEffect } from "react";
import axios from "axios";

const File = ({ file_text, close, active_name, serverUrl }) => {
  const [input, setInput] = useState("");
  const [activeFile, setActiveFile] = useState(null);

  const handleTab = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const cursorPos = e.target.selectionStart;
      const textBefore = input.substring(0, cursorPos);
      const textAfter = input.substring(cursorPos);
      setInput(textBefore + "\t" + textAfter);

      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = cursorPos + 1;
      }, 0);
    }
  };

  const sendCommandToServer = (command) => {
    axios
      .post(`${serverUrl}/send-command`, { command })
      .then((response) => {
        handleReceivedData(response.data.message);
      })
      .catch((error) => {
        console.error("Error sending command:", error.response?.data || error.message);
      });
  };

  useEffect(() => {
    if (activeFile !== active_name) {
      command(active_name);
    }
  }, [active_name]); 

  const command = (name) => {
    setActiveFile(name);
    console.log("active -", activeFile);
    const data = `with open('${name}', 'r') as file:\n    print(file.read())`;
    console.log(data);
    sendCommandToServer(data);
  };
  const handleReceivedData = (data) => {
    const formattedInput = data.join('\n');
    setInput(formattedInput);
  };


  const reverseFormatting = (formattedInput) => {
    return formattedInput
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\')
      .replace(/\\t/g, '\t');
  };

  const handle_Save = () => {
    if (activeFile !== null && input !== "") {
      const formattedInput = input
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');

      const data = `with open('${activeFile}', 'w') as file:\n    file.write('${formattedInput}')`;
      sendCommandToServer(data);
    }
  };

  const handle_close = function(name){
    close(name);
    if(activeFile === name){
      setActiveFile(null);
    }
    setInput("");
  }

  return (
    <div className="w-full h-full flex flex-col gap-1 bg-zinc-800/70 overflow-x-auto">
      <div className="w-full flex gap-1 bg-zinc-800/70 text-zinc-200 font-thin">
        {file_text.map((name, index) => (
          <div key={index} className={`flex items-center px-2 py-[2px] text-sm ${activeFile === name ? 'bg-zinc-900' : 'bg-zinc-700'}`}>
            <button className="hover:underline" onClick={() => command(name)}>
              {name.split("/").filter(Boolean).at(-1)}
            </button>
            <button className="ml-2 text-red-400 hover:text-red-600" onClick={() => handle_close(name)}>
              ✕
            </button>
          </div>
        ))}
        {activeFile &&
        <div className="ml-auto">
          <button className="bg-zinc-700 px-4" onClick={handle_Save}>
            Save
          </button>
        </div>
        }
      </div>

      <textarea
        className="w-full h-full bg-zinc-900 resize-none outline-none text-white p-4 font-thin"
        spellCheck={false}
        value={reverseFormatting(input)}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleTab}
      />
    </div>
  );
};

export default File;
