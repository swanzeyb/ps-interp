import Stack from './Stack'

export default class PostScriptInterpreter {
  public scoping: 'dynamic' | 'static'
  public operand_stack: Stack
  public dictionary_stack: Stack

  ///
  /// Start: Public API
  ///

  constructor(
    { scoping }: { scoping: 'dynamic' | 'static' } = { scoping: 'dynamic' }
  ) {
    this.scoping = scoping
    this.operand_stack = new Stack()
    this.dictionary_stack = new Stack()
    this.dictionary_stack.push({})

    this.register_operator('def', this.def_operation.bind(this))
    this.register_operator('add', this.add_operation.bind(this))
    this.register_operator('sub', this.sub_operation.bind(this))
    this.register_operator('mul', this.mul_operation.bind(this))
    this.register_operator('div', this.div_operation.bind(this))
    this.register_operator('mod', this.mod_operation.bind(this))
    this.register_operator('not', this.not_operation.bind(this))
    this.register_operator('or', this.or_operation.bind(this))
    this.register_operator('and', this.and_operation.bind(this))
    this.register_operator('lt', this.lt_operation.bind(this))
    this.register_operator('gt', this.gt_operation.bind(this))
    this.register_operator('ne', this.ne_operation.bind(this))
    this.register_operator('eq', this.eq_operation.bind(this))
    this.register_operator('dict', this.dict_operation.bind(this))
    this.register_operator('begin', this.begin_operation.bind(this))
  }

  execute(input: string) {
    if (this.scoping === 'dynamic') {
      // dynamic scoping
    } else {
      // static scoping
    }

    if (input !== '') {
      for (const word of input.split(' ')) {
        this.process_input(word)
      }
    }
  }

  set stack(stack: any[]) {
    this.operand_stack.stack = stack
  }

  get stack() {
    return this.operand_stack.stack
  }

  set_scoping(scoping: 'dynamic' | 'static') {
    this.scoping = scoping
  }

  current_scope() {
    return this.dictionary_stack.peek()
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
      if (normal !== '') {
        for (const word of normal.split(' ')) {
          this.process_input(word)
        }
      }

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

  begin_operation() {
    if (this.operand_stack.size() >= 1) {
      const dict = this.operand_stack.pop()
      if (typeof dict === 'object') {
        this.dictionary_stack.push(dict)
      } else {
        console.log('Invalid operand.')
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  dict_operation() {
    if (this.operand_stack.size() >= 1) {
      const count = this.operand_stack.pop()
      if (typeof count !== 'number') {
        console.log('Invalid operand.')
        return
      }

      this.operand_stack.push({})
    } else {
      console.log('Not enough operands.')
    }
  }

  eq_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      this.operand_stack.push(op1 === op2)
    } else {
      console.log('Not enough operands.')
    }
  }

  ne_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      this.operand_stack.push(op1 !== op2)
    } else {
      console.log('Not enough operands.')
    }
  }

  gt_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      this.operand_stack.push(op2 > op1)
    } else {
      console.log('Not enough operands.')
    }
  }

  lt_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      this.operand_stack.push(op2 < op1)
    } else {
      console.log('Not enough operands.')
    }
  }

  and_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      this.operand_stack.push(op1 && op2)
    } else {
      console.log('Not enough operands.')
    }
  }

  or_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      this.operand_stack.push(op1 || op2)
    } else {
      console.log('Not enough operands.')
    }
  }

  not_operation() {
    if (this.operand_stack.size() >= 1) {
      const value = this.operand_stack.pop()
      this.operand_stack.push(!value)
    } else {
      console.log('Not enough operands.')
    }
  }

  mod_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      const result = op2 % op1
      this.operand_stack.push(result)
    } else {
      console.log('Not enough operands.')
    }
  }

  div_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      const result = op2 / op1
      this.operand_stack.push(result)
    } else {
      console.log('Not enough operands.')
    }
  }

  mul_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      const result = op1 * op2
      this.operand_stack.push(result)
    } else {
      console.log('Not enough operands.')
    }
  }

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

  sub_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      const result = op2 - op1
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
