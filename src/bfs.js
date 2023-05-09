import React, { useCallback, useState } from 'react'
import { ActionButton, ActivityIndicator } from './components';
import Heapq from './utilities/heapq'

let gridDimensions = [28, 28];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let CURRENT_STATE = 'SELECT_START_BLOCK'
let globaltoggler = false

function heuristic(start, end){
    return Math.abs(end[0] - start[0]) + Math.abs(end[1] - start[1])
}


function hsv2rgb(val) {
    // adapted from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
    let h = Math.floor((100 - val) * 120 / 100);
    let s = Math.abs(val - 90)/50;
    let v = 1;
    let rgb, i, data = [];
    if (s === 0) {
      rgb = [v,v,v];
    } else {
      h = h / 60;
      i = Math.floor(h);
      data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
      switch(i) {
        case 0:
          rgb = [v, data[2], data[0]];
          break;
        case 1:
          rgb = [data[1], v, data[0]];
          break;
        case 2:
          rgb = [data[0], v, data[2]];
          break;
        case 3:
          rgb = [data[0], data[1], v];
          break;
        case 4:
          rgb = [data[2], data[0], v];
          break;
        default:
          rgb = [v, data[0], data[1]];
          break;
      }
    }
    return '#' + rgb.map(function(x){
      return ("0" + Math.round(x*255).toString(16)).slice(-2);
    }).join('');
  };

function getNumber(i, j){
    return i*gridDimensions[0]+j
}

function getIndices(k){
    return [Math.floor(k/gridDimensions[0]), k%gridDimensions[1]]
}

function BFS() {
  const generateRandomNumber = (min, max, sparse=false) => {
      let n = Math.floor(Math.random() * (max - min + 1)) + min;
      if (sparse){
        n = Math.floor(Math.random() * (max - min + 1) * Math.random()) + min;
      }
    return n
  }

  const generateGrid = (gridDimensions, isEdgeWeightsDynamic, isBarObstacle) => {
    let [m, n] = gridDimensions;
    let grid = [];
    let c = 0
    for (let i=0; i<m; i++){
        let row = [];
        for (let j=0; j<n; j++){
            row.push({key: c, value: isEdgeWeightsDynamic?generateRandomNumber(1, 100): isBarObstacle?0: generateRandomNumber(0, 1, true), visited:false, dist:Infinity, isInPath:false})
            c+=1
        }
        grid.push(row)
    }
    if (isBarObstacle){
        for (let j=0; j<26; j++){
            grid[5][j].value = 100000
            grid[10][j].value = 100000
            grid[19][j+2].value = 100000
            grid[17][j].value = 100000
        }
    
        for (let j=10; j<15; j++){
            grid[8][j].value = 100000
            grid[21][j].value = 100000
        }
    }
    return grid
  }
  let containerHeight = 600;
  const [isBarObstacle, setBarObstacle] = useState(false);
  const [isEdgeWeightsDynamic, setEdgeWeightDynamic] = useState(false);
  const [grid, setGrid] = useState(generateGrid(gridDimensions));
  const [startBlock, setStartBlock] = useState([-1, -1]);
  const [endBlock, setEndBlock] = useState([-1, -1]);
  const [isPlaying, setPlaying] = useState(false);
  const [diagonalAllowed, setDiagonalAllowd] = useState(false);
  const [toggler, setToggler] = useState(globaltoggler);
  
  const onGridClick = (i, j) => {
      return () => {
        switch(CURRENT_STATE){
            case 'SELECT_START_BLOCK':
                setStartBlock([i, j])
                updateState('SELECT_END_BLOCK')
                break
            case 'SELECT_END_BLOCK':
                setEndBlock([i, j]);
                updateState('BLOCKS_SET')
                break
        }
      }
  };
  const isValidBlock = (i, j) => {
    if (i>=0 && i<gridDimensions[0] && j>=0 && j<gridDimensions[1] && grid[i][j].value === 0 && !(grid[i][j].visited)){
        return true
    }
    return false
  }
  const isValidDjikstraBlock = (i, j) => {
    if (i>=0 && i<gridDimensions[0] && j>=0 && j<gridDimensions[1]){
        return true
    }
    return false
  }
  let directions = diagonalAllowed? [[1, 0],[-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]: [[1, 0],[-1, 0], [0, 1], [0, -1]]
  const bfs = async () => {
    let found = false;
    let queue = [];
    let predecessor = {};
    queue.push([startBlock[0], startBlock[1], 0]);
    predecessor[getNumber(startBlock[0], startBlock[1])] = -1
    grid[startBlock[0]][startBlock[1]].visited = true
    grid[startBlock[0]][startBlock[1]].dist = 0
    let i, j, d = [-1, -1, 0]
    while (queue.length){
        [i, j, d] = queue.shift();
        globaltoggler = !globaltoggler
        setToggler(globaltoggler);
        await sleep(1);
        if (i===endBlock[0] && j===endBlock[1]){
            found = true
            break
        }
        directions.forEach((direction)=>{
            let [ni, nj] = [i+direction[0], j+direction[1]]
            if (isValidBlock(ni, nj)){
                grid[ni][nj].visited  = true
                grid[ni][nj].dist = d+1
                predecessor[getNumber(ni, nj)] = getNumber(i, j)
                queue.push([ni, nj, d+1])
            }
        })
    }
    if (found && !isEdgeWeightsDynamic){
        let n = getNumber(endBlock[0], endBlock[1])
        while(predecessor[n]!=undefined){
            let [i, j] = getIndices(n)
            grid[i][j].isInPath = true
            n = predecessor[n]
            globaltoggler = !globaltoggler
            setToggler(globaltoggler);
            await sleep(1);
        }
    }
  }
  const dfs = async (i, j, d) => {
    grid[i][j].visited = true
    grid[i][j].dist = d
    globaltoggler = !globaltoggler
    setToggler(globaltoggler);
    await sleep(10);
    if (i===endBlock[0] && j===endBlock[1]){
        return true
    }
    for (let k=0; k<directions.length; k++){
        let [ni, nj] = [i+directions[k][0], j+directions[k][1]]
        if (isValidBlock(ni, nj)){
            let res = await dfs(ni, nj, d+1)
            if (res===true){
                return true
            }
        }
    }
    return false
  }
  const updateState = (STATE) => {
    CURRENT_STATE = STATE
    globaltoggler = !globaltoggler
    setToggler(globaltoggler);
  }
  const onFindPath = async () => {
    if(CURRENT_STATE==='BLOCKS_SET'){
        setPlaying(true);
        await bfs()
        setPlaying(false)
        updateState('SELECT_START_BLOCK')
    }else{
        alert('select starting and ending grids')
    }
  }
  const onFindDFSPath = async () => {
    if(CURRENT_STATE==='BLOCKS_SET'){
        setPlaying(true)
        await dfs(startBlock[0], startBlock[1], 0)
        setPlaying(false)
        updateState('SELECT_START_BLOCK')
    }else{
        alert('select starting and ending grids')
    }
  }
  const onReset = () => {
      setStartBlock([-1, -1]);
      setEndBlock([-1, -1]);
      grid.forEach((row)=>{
          row.forEach((block)=>{
              block.visited = false
              block.isInPath = false
              block.dist = Infinity
          })
      })
      setGrid(grid)
  }
  const onDiagonalToggle = () => {
      setDiagonalAllowd(!diagonalAllowed)
  }
  const onEdgeWeightToggle = () => {
      setGrid(generateGrid(gridDimensions, !isEdgeWeightsDynamic, isBarObstacle))
      setEdgeWeightDynamic(!isEdgeWeightsDynamic)
  }
  const onBarObstacleToggle = () => {
      setGrid(generateGrid(gridDimensions, isEdgeWeightsDynamic, !isBarObstacle))
      setBarObstacle(!isBarObstacle)
  }
  const onFindDjisktraPath = async () => {
    onReset();
    function comparator(a, b){
        return a[0]<b[0]
    }
    
    const heapq = new Heapq(comparator);
    let found = false;
    let predecessor = {};
    heapq.heappush([0, startBlock[0], startBlock[1]]);
    predecessor[getNumber(startBlock[0], startBlock[1])] = -1
    grid[startBlock[0]][startBlock[1]].visited = true
    grid[startBlock[0]][startBlock[1]].dist = 0
    let i, j, d = [-1, -1, 0]
    while (heapq.getSize()){
        let sig = heapq.heappop();
        d = sig[0]
        i = sig[1]
        j = sig[2]

        // console.log("sdf", d, i, j, heapq.getArray())
        globaltoggler = !globaltoggler
        setToggler(globaltoggler);
        await sleep(1);
        if (i===endBlock[0] && j===endBlock[1]){
            found = true
            break
        }
        directions.forEach((direction)=>{
            let [ni, nj] = [i+direction[0], j+direction[1]]
            if (isValidDjikstraBlock(ni, nj)){
                let nd = d + grid[ni][nj].value
                if (nd<grid[ni][nj].dist){
                    grid[ni][nj].dist = nd
                    heapq.heappush([nd, ni, nj])
                    grid[ni][nj].visited  = true
                    predecessor[getNumber(ni, nj)] = getNumber(i, j)
                }
            }
        })
    }
    if (found){
        let n = getNumber(endBlock[0], endBlock[1])
        while(predecessor[n]!=undefined){
            let [i, j] = getIndices(n)
            grid[i][j].isInPath = true
            n = predecessor[n]
            globaltoggler = !globaltoggler
            setToggler(globaltoggler);
            await sleep(1);
        }
    }
    updateState('SELECT_START_BLOCK')
  }
  const onFindAstarPath = async () => {
    onReset();
    function comparator(a, b){
        return a[0]<b[0]
    }
    
    const heapq = new Heapq(comparator);
    let found = false;
    let predecessor = {};
    heapq.heappush([0, startBlock[0], startBlock[1]]);
    predecessor[getNumber(startBlock[0], startBlock[1])] = -1
    grid[startBlock[0]][startBlock[1]].visited = true
    grid[startBlock[0]][startBlock[1]].dist = 0
    let i, j, priority = [-1, -1, 0]
    while (heapq.getSize()){
        let sig = heapq.heappop();
        console.log("sdf", sig)
        priority = sig[0]
        i = sig[1]
        j = sig[2]

        // console.log("sdf", d, i, j, heapq.getArray())
        globaltoggler = !globaltoggler
        setToggler(globaltoggler);
        await sleep(1);
        if (i===endBlock[0] && j===endBlock[1]){
            found = true
            break
        }
        directions.forEach((direction)=>{
            let [ni, nj] = [i+direction[0], j+direction[1]]
            if (isValidDjikstraBlock(ni, nj)){
                let nd = grid[i][j].dist + grid[ni][nj].value
                if (nd<grid[ni][nj].dist){
                    grid[ni][nj].dist = nd
                    heapq.heappush([nd+heuristic([ni, nj], endBlock), ni, nj])
                    grid[ni][nj].visited  = true
                    predecessor[getNumber(ni, nj)] = getNumber(i, j)
                }
            }
        })
    }
    if (found){
        let n = getNumber(endBlock[0], endBlock[1])
        while(predecessor[n]!=undefined){
            console.log("nnnnn", n, getIndices(predecessor[n]))
            let [i, j] = getIndices(n)
            grid[i][j].isInPath = true
            n = predecessor[n]
            globaltoggler = !globaltoggler
            setToggler(globaltoggler);
            await sleep(1);
        }
    }
    updateState('SELECT_START_BLOCK')
  }
  return (
    <div style={{padding:10, height:"calc(100vh - 20px)", 
                width:"calc(100vw - 20px)"}}>
      <div style={{height:containerHeight, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:30, justifyContent:"flex-end"}}>
        {
            grid.map((row, rowIndex)=>(
                <div key={rowIndex} style={{display:"flex", flexDirection:"row"}}>
                    {
                        row.map((block, blockIndex)=>(
                            <>
                            <div onClick={onGridClick(rowIndex, blockIndex)} key={block.key} className="block r-c-c" style={{width: 20, height:20, fontSize:12, color:grid[rowIndex][blockIndex].isInPath?"white": "#aeaeae", backgroundColor:grid[rowIndex][blockIndex].isInPath?'#76C4AE':grid[rowIndex][blockIndex].visited? '#caeccf' : isEdgeWeightsDynamic? hsv2rgb(block.value):block.value===1?'#ddb0a0':'white', border:startBlock[0]===rowIndex&&startBlock[1]===blockIndex ? '1px solid green': endBlock[0]===rowIndex&&endBlock[1]===blockIndex ? '1px solid red' : null}}>
                                {grid[rowIndex][blockIndex].value}
                            </div>
                            </>
                        ))
                    }
                </div>
            ))
        }
      </div>
      <div style={{marginLeft:10, display:"flex", marginTop:15, alignItems:"center", justifyContent:"center"}}>
          {
              isPlaying?
              <ActivityIndicator/>
              :
              <>
                <ActionButton title="Reset" action={onReset}/>
                <ActionButton title="Find path (DFS)" action={onFindDFSPath}/>
                <ActionButton title="Find path (Djikstra)" action={onFindDjisktraPath}/>
                <ActionButton title="Find path (A*)" action={onFindAstarPath}/>
                <ActionButton title={`Find path (BFS)`} action={onFindPath}/>
                <ActionButton title="Find path (DFS)" action={onFindDFSPath}/>
                <ActionButton title={isBarObstacle?"Toggle to random obstacles":"Toggle to bar obstacles"} action={onBarObstacleToggle}/>
                <ActionButton title={diagonalAllowed?"Restrict Diagonal Movement":"Allow Diagonal Movement"} action={onDiagonalToggle}/>
                <ActionButton title={isEdgeWeightsDynamic?"Make edge weight constant":"Make edge weight dynamic"} action={onEdgeWeightToggle}/>
              </>
          }

       </div>
    </div>
  )
}

export default BFS