import Stack from './Stack'
import TokenStream from './TokenStream'

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
    this.dictionary_stack.push({ __global__: true })
    this.dictionary_stack.push({ __global__: true })

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
    this.register_operator('end', this.end_operation.bind(this))
    this.register_operator('length', this.length_operation.bind(this))
    this.register_operator('if', this.if_operation.bind(this))
    this.register_operator('ifelse', this.if_else_operation.bind(this))
    this.register_operator('dup', this.dup_operation.bind(this))
    this.register_operator('for', this.for_operation.bind(this))
    this.register_operator('repeat', this.repeat_operation.bind(this))
    this.register_operator('print', this.print_operation.bind(this))
    this.register_operator('=', this.pop_print_operation.bind(this))
    this.register_operator('==', this.pretty_print_operation.bind(this))
    this.register_operator('exch', this.exch_operation.bind(this))
  }

  execute(input: string) {
    if (input !== '') {
      this.process_input(new TokenStream(input.trim().split(' ')))
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
      this.execute(normal)

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

  private process_boolean(value: TokenStream) {
    if (value.peek() === 'true') {
      value.advance()
      return [true, true]
    } else if (value.peek() === 'false') {
      value.advance()
      return [true, false]
    } else {
      return false
    }
  }

  private process_number(value: TokenStream) {
    const result = Number(value.peek())
    if (isNaN(result)) {
      return false
    } else {
      value.advance()
      return [true, result]
    }
  }

  private process_string(value: TokenStream) {
    if (value.peek().at(0) === '(') {
      let str = ''
      let lhs = 0
      let rhs = 0

      // Look for closing string bracket
      for (const token of value.next()) {
        for (const char of token.split('')) {
          str += char
          if (char === '(') {
            lhs++
          } else if (char === ')') {
            rhs++
          }

          if (lhs === rhs) {
            break
          }
        }
        str += ' '
      }
      str = str.trim()

      return [true, str]
    } else {
      return false
    }
  }

  private process_code_block(value: TokenStream) {
    if (value.peek().at(0) === '{') {
      // Capture the code block as string
      let block = ''
      let lhs = 0
      let rhs = 0

      // Look for closing code block bracket
      for (const token of value.next()) {
        for (const char of token.split('')) {
          block += char
          if (char === '{') {
            lhs++
          } else if (char === '}') {
            rhs++
          }

          if (lhs === rhs) {
            break
          }
        }
        block += ' '
      }
      block = block.trim()

      return [true, block]
    } else {
      return false
    }
  }

  private process_name_constant(value: TokenStream) {
    if (value.peek() === '/') {
      return [true, value.advance()]
    } else {
      return false
    }
  }

  private process_constants(input: TokenStream) {
    return (
      this.process_boolean(input) ||
      this.process_number(input) ||
      this.process_string(input) ||
      this.process_code_block(input) ||
      this.process_name_constant(input)
    )
  }

  private lookup_in_dictionary(input: string) {
    const lookup = {
      ...this.dictionary_stack.stack.at(0),
      ...this.dictionary_stack.stack.at(1),
    }

    if (lookup[input]) {
      const value = lookup[input]

      if (typeof value === 'function') {
        value()
      } else {
        this.operand_stack.push(value)
      }
    }
  }

  private process_input(input: TokenStream) {
    const result = this.process_constants(input)
    if (result) {
      this.operand_stack.push(result[1])
    } else {
      this.lookup_in_dictionary(input.advance())
    }

    // Continue processing tokens
    if (!input.eof()) {
      this.process_input(input)
    }
  }

  private register_operator(name: string, operator: Function) {
    this.dictionary_stack.peek()[name] = operator
  }

  private strip_enclosure(value: string, open = '{', close = '}') {
    if (value.at(0) === open && value.at(-1) === close) {
      return value.slice(1, -1)
    } else {
      return value
    }
  }

  ///
  /// End: Private API
  ///
  /// Start: Operators

  exch_operation() {
    if (this.operand_stack.size() >= 2) {
      const op1 = this.operand_stack.pop()
      const op2 = this.operand_stack.pop()
      this.operand_stack.push(op1)
      this.operand_stack.push(op2)
    } else {
      console.log('Not enough operands.')
    }
  }

  pretty_print_operation() {
    if (this.operand_stack.size() >= 1) {
      const value = this.operand_stack.pop()
      console.log(JSON.stringify(value, null, 2))
    } else {
      console.log('Not enough operands.')
    }
  }

  pop_print_operation() {
    if (this.operand_stack.size() >= 1) {
      const value = this.operand_stack.pop()
      console.log(value)
    } else {
      console.log('Not enough operands.')
    }
  }

  print_operation() {
    if (this.operand_stack.size() >= 1) {
      const value = this.operand_stack.pop()

      if (typeof value === 'object') {
        console.log(JSON.stringify(value, null, 2))
      } else if (value.at(0) === '(' && value.at(-1) === ')') {
        console.log(this.strip_enclosure(value, '(', ')'))
      } else {
        console.log(value)
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  repeat_operation() {
    if (this.operand_stack.size() >= 2) {
      const code_block = this.operand_stack.pop()
      const count = this.operand_stack.pop()

      for (let i = 0; i < count; i++) {
        this.execute(this.strip_enclosure(code_block))
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  for_operation() {
    if (this.operand_stack.size() >= 4) {
      const code_block = this.operand_stack.pop()
      const end = this.operand_stack.pop()
      const increment = this.operand_stack.pop()
      const start = this.operand_stack.pop()

      for (let i = start; i <= end; i += increment) {
        this.operand_stack.push(i)
        this.execute(this.strip_enclosure(code_block))
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  dup_operation() {
    if (this.operand_stack.size() >= 1) {
      const value = this.operand_stack.peek()
      this.operand_stack.push(value)
    } else {
      console.log('Not enough operands.')
    }
  }

  if_else_operation() {
    if (this.operand_stack.size() >= 3) {
      const else_block = this.operand_stack.pop()
      const if_block = this.operand_stack.pop()
      const condition = this.operand_stack.pop()

      if (condition) {
        this.execute(this.strip_enclosure(if_block))
      } else {
        this.execute(this.strip_enclosure(else_block))
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  if_operation() {
    if (this.operand_stack.size() >= 2) {
      const code_block = this.operand_stack.pop()
      const condition = this.operand_stack.pop()

      if (condition) {
        this.execute(this.strip_enclosure(code_block))
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  length_operation() {
    if (this.operand_stack.size() >= 1) {
      const value = this.operand_stack.pop()
      if (typeof value === 'string') {
        this.operand_stack.push(value.length)
      } else if (typeof value === 'object') {
        this.operand_stack.push(Object.keys(value).length - 1)
      } else {
        console.log('Invalid operand.')
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  end_operation() {
    if (this.dictionary_stack.size() >= 3) {
      this.dictionary_stack.pop()
    } else {
      console.log('Not enough operands.')
    }
  }

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

      this.operand_stack.push({ __global__: false })
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
