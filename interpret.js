class Stack {
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

const operand_stack = new Stack()
const dictionary_stack = new Stack()
dictionary_stack.push({})

function process_boolean(value) {
  if (value === 'true') {
    return [true, true]
  } else if (value === 'false') {
    return [true, false]
  } else {
    return false
  }
}

function process_number(value) {
  const result = Number(value)
  if (isNaN(result)) {
    return false
  } else {
    return [true, result]
  }
}

function process_code_block(value) {
  if (value.length >= 2 && value.at(0) === '{' && value.at(-1) === '}') {
    // broken, probably should push the stuff inside of value.slice
    return [true, value.slice(1, -1)]
  } else {
    return false
  }
}

function process_name_constant(value) {
  if (value.at(0) === '/') {
    return [true, value]
  } else {
    return false
  }
}

function process_constants(input) {
  return (
    process_boolean(input) ||
    process_number(input) ||
    process_code_block(input) ||
    process_name_constant(input)
  )
}

function lookup_in_dictionary(input) {
  const top_dict = dictionary_stack.peek()
  if (top_dict[input]) {
    const value = top_dict[input]

    if (typeof value === 'function') {
      value()
    } else {
      operand_stack.push(value)
    }
  }
}

function process_input(input) {
  const result = process_constants(input)
  if (result) {
    operand_stack.push(result[1])
  } else {
    lookup_in_dictionary(input)
  }
}

function register_operator(name, operator) {
  dictionary_stack.peek()[name] = operator
}

function add_operation() {
  if (operand_stack.size() >= 2) {
    const op1 = operand_stack.pop()
    const op2 = operand_stack.pop()
    const result = op1 + op2
    operand_stack.push(result)
  } else {
    console.log('Not enough operands.')
  }
}
register_operator('add', add_operation)

function def_operation() {
  if (operand_stack.size() >= 2) {
    const value = operand_stack.pop()
    const name = operand_stack.pop()

    // If name constant
    if (typeof name === 'string' && name.at(0) === '/') {
      const key = name.slice(1)
      dictionary_stack.peek()[key] = value
      // Need an elseif for something here...
    } else {
      operand_stack.push(name)
      operand_stack.push(value)
    }
  } else {
    console.log('Not enough operands.')
  }
}
register_operator('def', def_operation)

async function repl() {
  const prompt = 'REPL> '
  process.stdout.write(prompt)
  for await (const line of console) {
    const normal = line.toLowerCase().trim()

    // Quit
    if (normal === 'quit') {
      break
    }

    // Process input
    process_input(normal)

    // Debug print stack
    operand_stack.print()

    // Next prompt
    process.stdout.write(prompt)
  }
}

repl()
