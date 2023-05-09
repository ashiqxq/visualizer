import './App.css';
import { useState } from 'react';
import { ActionButton } from './components';

function nextGap(currentGap){
  if (currentGap<=1){
    return 0
  }
  return Math.ceil(currentGap/2)
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


let initBarCount = 20;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let speedVar = 100;
let isSorting = false;

function Sorts() {
  const generateArray = (barCount) => {
    let arr = [];
    for(let i = 0; i < barCount; i++)
        arr.push([Math.ceil(Math.random()*100), i]);
    return arr
  }
  const [colorMap, setColorMap] = useState({});
  const [barCount, setBarCount] = useState(initBarCount)
  const [colorList, setColorList] = useState({});
  const [toggler, setToggler] = useState(false);
  const [data, setData] = useState(generateArray(initBarCount));
  let containerHeight = 500;
  let containerWidth = 1000;
  let mxVal = Math.max.apply(Math, data.map(item=>item[0]));
  let barWidth = parseFloat(containerWidth/(data.length)).toFixed(4);


  const [delay, setDelay] = useState('1000');
  data.forEach((val)=>{
    if(!(val[0] in colorMap)){
      let randomColor = getRandomColor();
      if (!(randomColor in colorList)){
        colorMap[val[0]] = randomColor;
        colorList[randomColor] = 1
      }
    }
  });
  const onBubbleSort = async () => {
    isSorting = true;
    let arr = [...data];
    let temp = 0
    let swapped = 0
    for (let i=0; i<arr.length; i++){
      for (let j=0; j<arr.length-i-1; j++){
          if (!isSorting){
            return
          }
          if (arr[j][0]>arr[j+1][0]){
            temp = {...arr[j]}
            arr[j] = {...arr[j+1]}
            arr[j+1] = temp
            swapped = 1
          }
          setData([...arr]);
        if (arr.length>200 && !(200-speedVar)){
        }else{
          await sleep(200-speedVar)
        }
      }
      if (!swapped){
        break
      }
    }
    isSorting = false
  }

  const onSelectionSort = async () => {
    isSorting = true;
    let arr = [...data];
    let temp = 0
    for (let i=0; i<arr.length; i++){
      let min_index = i
      for (let j=i+1; j<arr.length; j++){
          if (!isSorting){
            return
          }
          if (arr[j][0]<arr[min_index][0]){
            min_index = j
          }
      }
      [arr[i], arr[min_index]] = [arr[min_index], arr[i]]
      setData([...arr]);
      if (arr.length>200 && !(200-speedVar)){
      }else{
        await sleep(200-speedVar)
      }
    }
    isSorting = false
  }

  const onInsertionSort = async () => {
    isSorting = true;
    let arr = [...data];
    for (let i = 0; i < arr.length-1; i++) {
      let j = i+1
      while (j > 0 && arr[j][0] < arr[j-1][0]) {
        if (!isSorting){
          return
        }
        let temp = [...arr[j]]
        arr[j] = [...arr[j-1]]
        arr[j-1] = [...temp]
        setData([...arr]);
        if (arr.length>200 && !(200-speedVar)){
        }else{
          await sleep(200-speedVar)
        }
        j--
      }
    }
    isSorting = false
  }

  const mergeSortSolve = async (l, r) => {
    if (l>=r){
      return false
    }
    let mid = l+Math.floor((r-l)/2)
    await mergeSortSolve(l, mid)
    await mergeSortSolve(mid+1, r)

    let gap = r-l+1;
    for (gap=nextGap(gap); gap>0; gap=nextGap(gap)){
      for (let i=l; i+gap<=r; i++){
        let j = i+gap;
        if (data[i][0]>data[j][0]){
          let temp = [...data[i]]
          data[i] = [...data[j]]
          data[j] = temp
          setData([...data]);
          if (data.length>200 && !(200-speedVar)){
          }else{
            await sleep(200-speedVar)
          }
        }
      }
    }
  }
  
  const quickSortSolve = async (l, r) => {
    if (l<r){
      let pivot = data[r][0]
      let i = l-1
      for (let j=l; j<r; j++){
        if (data[j][0]<=pivot){
          i = i+1
          let temp = [...data[j]]
          data[j] = [...data[i]]
          data[i] = [...temp]
          setData([...data]);
          if (data.length>200 && !(200-speedVar)){
          }else{
            await sleep(200-speedVar)
          }
        }
      }
      let temp = [...data[i+1]]
      data[i+1] = [...data[r]]
      data[r] = [...temp]
      setData([...data]);
      if (data.length>200 && !(200-speedVar)){
      }else{
        await sleep(200-speedVar)
      }
      i+=1
      await quickSortSolve(l, i-1)
      await quickSortSolve(i+1, r)
    }
  } 

  const onMergeSort = async () => {
    await mergeSortSolve(0, data.length-1)
  }

  const onQuickSort = async () => {
    await quickSortSolve(0, data.length-1)
  }

  const onChangeValues = () => {
    isSorting = false
    setData(generateArray(barCount));
  }
  const onSpeedChange = (e) => {
    speedVar=parseInt(e.target.value)
    setToggler(!toggler)
  }
  const onBarCountChange = (e) => {
      let newCount = parseInt(e.target.value);
      if (newCount!=newCount){
        setBarCount('')
      }else{
        setBarCount(Math.min(newCount, 500));
      }
  }
  return (
    <div style={{padding:10, height:"calc(100vh - 20px)", 
                width:"calc(100vw - 20px)"}}>
      <div style={{height:containerHeight, display:"flex", flexDirection:"row", alignItems:"flex-end", paddingTop:10, justifyContent:"center"}}>
        {
          data.map((val)=>(
            <div key={val[1]} id={`barBG${val[1]}`} 
            style={{width:28, height:containerHeight-10, display:"flex", alignItems:"flex-end", justifyContent:"center", transition:`0.01s linear all`}}>
              <div key={val[1]} id={`bar-${val[1]}`} style={{height:Math.round((containerHeight-10)*val[0]/mxVal), flex:1, backgroundColor:colorMap[val[0]], border: '1px solid #e6e6e6', borderTopLeftRadius:5, borderTopRightRadius:5}}>

              </div>
            </div>
          ))
        }
      </div>
      <div style={{marginLeft:10, display:"flex", marginTop:15, alignItems:"center", justifyContent:"center"}}>
        <ActionButton title="Bubble sort" action={onBubbleSort}/>
        <ActionButton title="Selection sort" action={onSelectionSort}/>
        <ActionButton title="Merge sort" action={onMergeSort}/>
        <ActionButton title="Quick sort" action={onQuickSort}/>
        <ActionButton title="Insertion sort" action={onInsertionSort}/>
       </div>
       <div style={{display:"flex", marginTop:15, alignItems:"center", justifyContent:"center"}}>
          <div>
            <div style={{fontSize:12, color:"#aeaeae", marginBottom:5}}>No of bars</div>
            <input style={{border:"1px solid #e6e6e6", borderRadius:5, color:"#191919", marginBottom:5}} type="number" value={`${barCount}`} onChange={onBarCountChange}/>
            <div className="r-c-c button" style={{border:"1px solid black"}} onClick={onChangeValues}>
              <div>
                Render new bars
              </div>
            </div>
          </div>
          <div className="r-c-c-c m-l-15">
            <input type="range" min="1" max="200" value={speedVar} onChange={onSpeedChange} id="speedRangeSlider"/>
            <div style={{fontSize:12, color:"#aeaeae"}}>
              Control speed
            </div>
          </div>
       </div>
    </div>
  );
}

export default Sorts;
