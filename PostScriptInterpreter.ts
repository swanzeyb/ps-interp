import Stack from './Stack'

export default class PostScriptInterpreter {
  private scoping: 'dynamic' | 'static'
  private operand_stack: Stack
  private dictionary_stack: Stack

  ///
  /// Start: Public API
  ///

  constructor({ scoping }: { scoping: 'dynamic' | 'static' }) {
    this.scoping = scoping
    this.operand_stack = new Stack()
    this.dictionary_stack = new Stack()
    this.dictionary_stack.push({})

    this.register_operator('add', this.add_operation)
    this.register_operator('def', this.def_operation)
  }

  execute() {
    if (this.scoping === 'dynamic') {
      // dynamic scoping
    } else {
      // static scoping
    }
  }

  set stack(stack: any[]) {
    this.operand_stack.stack = stack
  }

  setScoping(scoping: 'dynamic' | 'static') {
    this.scoping = scoping
  }

  async repl() {
    const prompt = 'REPL> '
    process.stdout.write(prompt)
    for await (const line of console) {
      const normal = line.toLowerCase().trim()

      // Quit
      if (normal === 'quit') {
        break
      }

      // Process input
      this.process_input(normal)

      // Debug print stack
      this.operand_stack.print()

      // Next prompt
      process.stdout.write(prompt)
    }
  }

  ///
  /// End: Public API
  ///
  /// Start: Private API

  private process_boolean(value: string) {
    if (value === 'true') {
      return [true, true]
    } else if (value === 'false') {
      return [true, false]
    } else {
      return false
    }
  }

  private process_number(value: string) {
    const result = Number(value)
    if (isNaN(result)) {
      return false
    } else {
      return [true, result]
    }
  }

  private process_code_block(value: string) {
    if (value.length >= 2 && value.at(0) === '{' && value.at(-1) === '}') {
      // broken, probably should push the stuff inside of value.slice
      return [true, value.slice(1, -1)]
    } else {
      return false
    }
  }

  private process_name_constant(value: string) {
    if (value.at(0) === '/') {
      return [true, value]
    } else {
      return false
    }
  }

  private process_constants(input: string) {
    return (
      this.process_boolean(input) ||
      this.process_number(input) ||
      this.process_code_block(input) ||
      this.process_name_constant(input)
    )
  }

  private lookup_in_dictionary(input: string) {
    const top_dict = this.dictionary_stack.peek()
    if (top_dict[input]) {
      const value = top_dict[input]

      if (typeof value === 'function') {
        value()
      } else {
        this.operand_stack.push(value)
      }
    }
  }

  private process_input(input: string) {
    const result = this.process_constants(input)
    if (result) {
      this.operand_stack.push(result[1])
    } else {
      this.lookup_in_dictionary(input)
    }
  }

  private register_operator(name: string, operator: Function) {
    this.dictionary_stack.peek()[name] = operator
  }

  ///
  /// End: Private API
  ///
  /// Start: Operators

  add_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      const result = op1 + op2
      this.operand_stack.push(result)
    } else {
      console.log('Not enough operands.')
    }
  }

  def_operation() {
    if (this.operand_stack.size() >= 2) {
      const value = this.operand_stack.pop()
      const name = this.operand_stack.pop()

      // If name constant
      if (typeof name === 'string' && name.at(0) === '/') {
        const key = name.slice(1)
        this.dictionary_stack.peek()[key] = value
        // Need an elseif for something here...
      } else {
        this.operand_stack.push(name)
        this.operand_stack.push(value)
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  ///
  /// End: Operators
  ///
}
