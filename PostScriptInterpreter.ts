import Stack from './Stack'
import TokenStream from './TokenStream'
import CodeBlock from './CodeBlock'

export default class PostScriptInterpreter {
  public scoping: 'dynamic' | 'static'
  public operand_stack: Stack
  public dictionary_stack: Stack
  public current_dictionary: { [key: string]: any }

  ///
  /// Start: Public API
  ///

  constructor(
    { scoping }: { scoping: 'dynamic' | 'static' } = { scoping: 'dynamic' }
  ) {
    this.scoping = scoping
    this.operand_stack = new Stack()
    this.dictionary_stack = new Stack()

    // Operator dictionary
    this.dictionary_stack.push({ __global__: true, __parent__: null })
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
    this.register_operator('pop', this.pop_operation.bind(this))
    this.register_operator('clear', this.clear_operation.bind(this))
    this.register_operator('copy', this.copy_operation.bind(this))
    this.register_operator('count', this.count_operation.bind(this))
    this.register_operator('get', this.get_operator.bind(this))
    this.register_operator('getinterval', this.getinterval_operation.bind(this))
    this.register_operator('putinterval', this.putinterval_operation.bind(this))
    this.register_operator('use-dynamic', () => {
      this.set_scoping('dynamic')
      console.log('Dynamic scoping enabled.')
    })
    this.register_operator('use-static', () => {
      this.set_scoping('static')
      console.log('Static scoping enabled.')
    })

    // Global dictionary
    this.dictionary_stack.push({
      __global__: true,
      __parent__: this.dictionary_stack.peek(),
    })
    this.current_dictionary = this.dictionary_stack.peek()
  }

  execute(input: string) {
    if (input !== '') {
      this.process_input(new TokenStream(input.trim().split(' ')))
    }
  }

  set_scoping(scoping: 'dynamic' | 'static') {
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
        if (lhs === rhs) {
          break
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
        if (lhs === rhs) {
          break
        }
        block += ' '
      }
      block = block.trim()

      // Create a CodeBlock with the code and the current lexical environment
      const codeBlock = new CodeBlock(this.strip_enclosure(block, '{', '}'), {
        ...this.current_dictionary,
      })
      return [true, codeBlock]
    } else {
      return false
    }
  }

  private process_name_constant(value: TokenStream) {
    if (value.peek().at(0) === '/') {
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

  private execute_code_block(code_block: CodeBlock) {
    if (this.scoping === 'static') {
      // Save the previous current_dictionary
      const previous_dictionary = this.current_dictionary
      // Set the current_dictionary to the code block's lexical environment
      this.current_dictionary = code_block.lexical_env

      // Execute the code block
      this.process_input(new TokenStream(code_block.code.trim().split(' ')))

      // Restore the previous state
      this.current_dictionary = previous_dictionary
    } else {
      // For dynamic scoping, execute in the current environment without modifying the dictionary stack
      this.process_input(new TokenStream(code_block.code.trim().split(' ')))
    }
  }

  private execute_value(value: Function | string | CodeBlock) {
    if (typeof value === 'function') {
      value()
    } else if (value instanceof CodeBlock) {
      this.execute_code_block(value)
    } else {
      this.operand_stack.push(value)
    }
  }

  private lookup_value(input: string) {
    if (this.scoping === 'dynamic') {
      // Search the dictionary stack top-down
      for (const dictionary of [...this.dictionary_stack.stack].reverse()) {
        if (input in dictionary) {
          return dictionary[input]
        }
      }
    } else if (this.scoping === 'static') {
      // Only search the current lexical dictionary
      let dict = this.current_dictionary
      while (dict) {
        if (input in dict) {
          return dict[input]
        }
        // Move to the parent dictionary if available
        dict = dict.__parent__
      }
    }
  }

  private lookup_in_dictionary(input: string) {
    const value = this.lookup_value(input)
    if (value) {
      this.execute_value(value)
    }
  }

  private process_input(input: TokenStream) {
    while (!input.eof()) {
      const result = this.process_constants(input)
      if (result) {
        this.operand_stack.push(result[1])
      } else {
        const token = input.advance()
        this.lookup_in_dictionary(token)
      }
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

  putinterval_operation() {
    if (this.operand_stack.size() >= 3) {
      const substr = this.strip_enclosure(this.operand_stack.pop(), '(', ')')
      const index = this.operand_stack.pop()
      const str = this.strip_enclosure(this.operand_stack.pop(), '(', ')')

      if (
        typeof str === 'string' &&
        typeof index === 'number' &&
        typeof substr === 'string'
      ) {
        this.operand_stack.push(
          `(${str.slice(0, index) + substr + str.slice(index + substr.length)})`
        )
      } else {
        console.log('Invalid operand.')
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  getinterval_operation() {
    if (this.operand_stack.size() >= 3) {
      const count = this.operand_stack.pop()
      const index = this.operand_stack.pop()
      const str = this.strip_enclosure(this.operand_stack.pop(), '(', ')')

      if (
        typeof str === 'string' &&
        typeof index === 'number' &&
        typeof count === 'number'
      ) {
        this.operand_stack.push(`(${str.slice(index, index + count)})`)
      } else {
        console.log('Invalid operand.')
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  get_operator() {
    if (this.operand_stack.size() >= 2) {
      const index = this.operand_stack.pop()
      const str = this.strip_enclosure(this.operand_stack.pop(), '(', ')')

      if (typeof str === 'string' && typeof index === 'number') {
        this.operand_stack.push(`(${str.at(index)})`)
      } else {
        console.log('Invalid operand.')
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  count_operation() {
    this.operand_stack.push(this.operand_stack.size())
  }

  copy_operation() {
    if (this.operand_stack.size() >= 2) {
      const count = this.operand_stack.pop()
      for (let i = 0; i < count; i++) {
        this.operand_stack.push(this.operand_stack.stack.at(i))
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  clear_operation() {
    this.operand_stack.stack = []
  }

  pop_operation() {
    if (this.operand_stack.size() >= 1) {
      this.operand_stack.pop()
    } else {
      console.log('Not enough operands.')
    }
  }

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
        this.operand_stack.push(value.length - 2)
      } else if (typeof value === 'object') {
        this.operand_stack.push(Object.keys(value).length - 1)
      } else {
        console.log('Invalid operand.')
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  // end_operation() {
  //   if (this.dictionary_stack.size() >= 3) {
  //     this.dictionary_stack.pop()
  //     // Restore the previous current_dictionary
  //     this.current_dictionary = this.current_dictionary.__parent__
  //   } else {
  //     console.log('Not enough operands.')
  //   }
  // }

  end_operation() {
    if (this.dictionary_stack.size() >= 1) {
      if (this.scoping === 'static') {
        // this.current_dictionary = this.dictionary_stack.peek()
      } else {
        this.dictionary_stack.pop()
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  begin_operation() {
    if (this.operand_stack.size() >= 1) {
      const dict = this.operand_stack.pop()
      if (typeof dict === 'object') {
        if (this.scoping === 'static') {
          this.current_dictionary = dict
        } else {
          this.dictionary_stack.push(dict)
        }
      } else {
        console.log('Invalid operand.')
      }
    } else {
      console.log('Not enough operands.')
    }
  }

  // begin_operation() {
  //   if (this.operand_stack.size() >= 1) {
  //     const dict = this.operand_stack.pop()
  //     if (typeof dict === 'object') {
  //       this.dictionary_stack.push(dict)

  //       // Update current_dictionary for static scoping
  //       if (this.scoping === 'static') {
  //         this.current_dictionary = dict
  //       }
  //     } else {
  //       console.log('Invalid operand.')
  //     }
  //   } else {
  //     console.log('Not enough operands.')
  //   }
  // }

  dict_operation() {
    if (this.operand_stack.size() >= 1) {
      const count = this.operand_stack.pop()
      if (typeof count !== 'number') {
        console.log('Invalid operand.')
        return
      }

      this.operand_stack.push({
        __global__: false,
        __parent__: this.current_dictionary,
      })
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

      // If name is a name constant
      if (typeof name === 'string' && name.at(0) === '/') {
        const key = name.slice(1)
        if (this.scoping === 'static') {
          // Store in current_dictionary for static scoping
          this.current_dictionary[key] = value
        } else {
          // Store in the top dictionary for dynamic scoping
          this.dictionary_stack.peek()[key] = value
        }
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
