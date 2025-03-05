import { useContext, useState } from 'react'
import Cmd from './parts/cmd'
import Bar from './parts/tab_bar'
import File from './parts/file'
import StorageAndRamInfo from './parts/storage'
import { memory_context } from './context/memory'
import URLs from './context/Urls'


function App() {
  const [memoryVisible, setMemoryVisible] = useState(false);
  const [text, setText] = useState([]);
  const [active_File, seTactive_File] = useState(null);
  const [serverUrl, setServerUrl] = useState("https://esp-32-igyl.onrender.com");

  
  const handle_memory_icon = (value) => {
    if(memoryVisible !== value){
      setMemoryVisible(value);
    }
  };

  const handle_bar_file = function(value){
    setText([...new Set([...text, value])]);
    seTactive_File(value);
    console.log(text);
  }

  const handle_close = function(name){
    setText(text.filter(item => item !== name));
  }

  return (
    <>
    <memory_context.Provider value={memoryVisible}>
    <div className='w-full min-h-screen bg-zinc-200 flex flex-row'>
       <Bar send_to_bar={handle_memory_icon} send_to_file={handle_bar_file} serverUrl={serverUrl}/>
       <div className='flex flex-col w-full'>
       {memoryVisible ? (
        <StorageAndRamInfo serverUrl={serverUrl}/>
        ) : (
          <>
          <div className='w-full h-full flex-grow '>
            <File file_text={text} close={handle_close} active_name={active_File} serverUrl={serverUrl}/>
          </div>
          <Cmd serverUrl={serverUrl}/>
          </>
        )}
       </div>
    </div>
    </memory_context.Provider>
    </>
  )
}

export default App;