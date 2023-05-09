import { useState } from 'react';
import './App.css';
import BFS from './bfs'
import { ActionButton } from './components';
import Sorts from './sorts';

const Components = [
  {
    name: 'Sorting Visulizer',
    component: () => <Sorts/>
  },
  {
    name: 'Path Finders',
    component: () => <BFS/>
  }
]

function App() {
  const [isSelected, setIsSelected] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(false)
  const onSelect = (index) => {
    return () => {
      setIsSelected(true);
      setSelectedIndex(index)
    }
  }
  if (isSelected){
    return Components[selectedIndex].component()
  }
  return (
    <div style={{height:"100vh", width:"100vw"}} className="r-c-c">
      {Components.map((item, index)=>(
        <div style={{marginLeft:10, marginRight:10}}>
         <ActionButton key={index} title={item.name} action={onSelect(index)}/>
        </div>
      ))}
    </div>
  );
}

export default App;
