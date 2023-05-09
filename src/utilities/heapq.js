function defaultComparator(a, b){
    return a<b
}
class Heapq {
    constructor(_comparator){
        this._items = [];
        this._size = 0
        this._comparator = _comparator || defaultComparator
    }
    heapify(items){
        this._items = items
        this._size = this._items.length
        for (let index=Math.floor((this._size+1)/2); index>=0; index--){
            this._sinkdown(index)
        }
    }
    heappush(val){
        this._items[this._size++] = val
        this._bubbleup(this._size-1)
    }
    getSize(){
        return this._size
    }
    getArray(){
        return [...this._items]
    }
    heappop(){
        if (this._size===0){
            return
        }
        let top = [...this._items[0]];
        let lastelement = this._items.pop()
        this._size--;
        if (this._size){
            this._items[0] = [...lastelement];
            this._sinkdown(0)
        }
        return top
    }
    peek(){
        return this._items[0]
    }
    _sinkdown(index){
        while (true){
            
            let currentElement = this._items[index]
            let leftchildindex = 2*index+1
            let rightchildindex = 2*index+2
            let minimumchildindex = -1
            if (rightchildindex<this._size){
                minimumchildindex = this._comparator(this._items[leftchildindex], this._items[rightchildindex]) ? leftchildindex: rightchildindex
                if (this._comparator(currentElement, this._items[minimumchildindex])){
                    return
                }
                this._items[index] = [...this._items[minimumchildindex]]
                this._items[minimumchildindex] = [...currentElement]
                index = minimumchildindex
            }else{
                if (leftchildindex<this._size){
                    minimumchildindex = leftchildindex
                    if (this._comparator(currentElement, this._items[minimumchildindex])){
                        return
                    }
                    this._items[index] = [...this._items[minimumchildindex]]
                    this._items[minimumchildindex] = [...currentElement]
                    index = minimumchildindex
                }else{
                    return
                }
            }
        }
    }
    _bubbleup(index){
        let currentElement = this._items[index];
        let parentIndex = null
        while (true){
            parentIndex = Math.floor((index-1)/2)
            if (parentIndex<0){
                return
            }
            if (this._comparator(currentElement, this._items[parentIndex])){
                this._items[index] = [...this._items[parentIndex]];
                this._items[parentIndex] = [...currentElement];
                index = parentIndex
            }else{
                return
            }
        }
    }
}

export default Heapq