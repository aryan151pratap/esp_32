import { useState, useEffect } from "react";
import axios from 'axios';
import folder_img from "../image/folder.png";
import document_img from "../image/documents.png";
import folder1_img from "../image/folder (1).png";
import memory_img from '../image/memories.png';

const Bar = function ({ send_to_bar, send_to_file, serverUrl }) {
  const [yes, no] = useState({ [memory_img]: false });
  const icon = [folder1_img, memory_img];
  const [file, setFile] = useState(["file.py", "main.py", "data.csv"]);
  const [isOpen, setIsOpen] = useState({});
  const [esp_connect, setconnect] = useState("Unable to connect to ESP32. . . .");
  const [add, setAdd] = useState(false);
  const [addFile, seTaddFile] = useState(null);

  const handleToggle = (folder) => {
    setIsOpen((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const handle_bar_icon = function (item, i) {
    const updatedState = { ...yes, [item]: !yes[item] };
    no(updatedState);
	if(i == 1){
    	send_to_bar(updatedState[item]);
	}
  };

  const fetchFolder = () => {
    axios
      .get(`${serverUrl}/folder`, {
        headers: {
          "ngrok-skip-browser-warning": "true", // Bypasses the warning page
        },
      })
      .then((response) => {
        console.log("folders dokeroimt",response.data)
        if(response.data !== null){
          setFile(response.data.folder);
          setconnect("connected to Esp32....");
        } else{
          setconnect("Unable to connect to ESP32. . . .");
        }
      })
      .catch((error) => {
        console.error("Error: ", error);
        setconnect("Unable to connect to ESP32. . . .");
      });
  };

  useEffect(() => {
    fetchFolder();
    const interval = setInterval(fetchFolder, 5000);
    return () => clearInterval(interval);
  }, [serverUrl]);


  const handle_page_content = function(item){
    send_to_file(item);
  }

  const printFiles = function (items, indent = "") {
    return items.map((item, index) => {
      if (typeof item === "string") {
        return (
          <div key={index}>
            <li className="hover:bg-zinc-700/40 p-1 px-4 cursor-pointer">
              <button className="flex gap-1"
              onClick={() => handle_page_content(indent + "/" + item)}>
                <img src={document_img} className="h-[18px]" />
                <span>{item}</span>
              </button>
            </li>
          </div>
        );
      } else if (typeof item === "object" && !Array.isArray(item)) {
        return Object.keys(item).map((folder, i) => (
          <div key={folder + i}>
            {console.log(folder + indent)}
            <li className={`hover:bg-zinc-700/40 p-1 flex cursor-pointer`}>
              <button className="flex w-full" onClick={() => handleToggle(folder + indent)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`ml-2 w-4 h-4 transform -rotate-${isOpen[folder + indent] ? 0 : 90}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
                <img src={folder_img} alt="" className="h-[18px]" />
                <span className="ml-2">{folder}</span>
              </button>
            </li>
            {isOpen[folder + indent] && <ul className="pl-2">{printFiles(item[folder], indent+"/"+folder)}</ul>}
          </div>
        ));
      }
      return null;
    });
  };

  const sendCommandToServer = (command) => {
    axios
      .post(`${serverUrl}/send-command`, { command })
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        console.error("Error sending command:", error.response?.data || error.message);
      });
  };

  const handle_add = function(e){
    seTaddFile(e.target.value);
  }

  function form(e) {
    e.preventDefault();
    console.log(addFile);
    if(addFile !== null){
      const data = `with open('${addFile}', 'w') as file:\n    file.write("")`;
      sendCommandToServer(data);
    }
    setAdd(false);
    seTaddFile(null);
}

  return (
    <>
      <div className="flex flex-row text-white">
        <div className="min-h-screen w-8 flex bg-zinc-800/90 flex flex-col py-2 px-[2px] gap-[10px] text-zinc-400 border-r-[1px] border-zinc-700">
          {icon.map((item, i) => (
            <button
              key={i}
              className={yes[item] ? `text-right hover:text-white flex justify-center text-sm` : ""}
              onClick={() => handle_bar_icon(item, i)}
            >
              <img src={item} alt="" />


            </button>
          ))}
        </div>

        {icon.map(
          (item, i) =>
            yes[item] &&
            i === 0 && (
              <div className="w-[200px] flex flex-col h-screen bg-zinc-800" key={i}>
                <div className="w-full h-6 flex bg-zinc-700/70">
                  <button className="px-2 ml-auto bg-zinc-700 text-sm"
                  onClick={() =>{setAdd(true)}}
                  >Add <span className="hover:bg-zinc-800 hover:text-green-500 px-2">+</span> </button>
                </div>
                { add && 
                <div className="w-full flex p-[1px]" onSubmit={form}>
                  <form action="">
                    <input type="text" value={addFile} name="" id="" onChange={handle_add} className="w-full h-full bg-zinc-900 outline-none px-4 text-sm font-thin" placeholder="Enter File. . . ."/>
                  </form>
                    <button className="px-2 text-red-400 hover:text-red-600" onClick={() => {setAdd(false)}}>
                      ✕
                    </button>
                </div>
                }
                <ul className="w-full py-2 flex flex-col text-[12px] text-zinc-200">
                  {printFiles(file)}
                </ul>
                <div className="flex flex-grow"></div>
                <div className="px-2 p-1 text-zinc-400 text-[12px]">
                  <label htmlFor="">{esp_connect}</label>
                </div>
              </div>
            )
          )}
      </div>
    </>
  );
};

export default Bar;
