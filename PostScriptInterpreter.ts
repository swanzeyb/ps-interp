import Stack from './Stack'
import '@bun/types'

export default class PostScriptInterpreter {
  private scoping: 'dynamic' | 'static'
  private operand_stack: Stack
  private dictionary_stack: Stack

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

  register_operator(name: string, operator: Function) {
    this.dictionary_stack.peek()[name] = operator
  }

  ///
  /// Start: Operators
  ///

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
}
