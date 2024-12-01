export default class Stack {
  constructor() {
    this.stack = []
  }

  push(value) {
    this.stack.push(value)
  }

  pop() {
    return this.stack.pop()
  }

  peek() {
    return this.stack.at(-1)
  }

  print() {
    console.log(this.stack)
  }

  isEmpty() {
    return this.stack.length === 0
  }

  size() {
    return this.stack.length
  }
}
