import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('Arithmetic Operations', () => {
  test('add: should add the top two elements of the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [3, 7]
    interpreter.execute('add')
    expect(interpreter.operand_stack.stack).toEqual([10])
  })

  test('sub: should subtract the top element from the second-to-top element', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [10, 3]
    interpreter.execute('sub')
    expect(interpreter.operand_stack.stack).toEqual([7])
  })

  test('mul: should multiply the top two elements of the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [4, 5]
    interpreter.execute('mul')
    expect(interpreter.operand_stack.stack).toEqual([20])
  })

  test('div: should divide the second-to-top element by the top element', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [20, 5]
    interpreter.execute('div')
    expect(interpreter.operand_stack.stack).toEqual([4])
  })

  test('mod: should compute the remainder of dividing the second-to-top element by the top element', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [10, 3]
    interpreter.execute('mod')
    expect(interpreter.operand_stack.stack).toEqual([1])
  })
})
