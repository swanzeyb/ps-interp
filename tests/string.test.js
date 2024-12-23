import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('String Operations', () => {
  test('length: should push the length of a string onto the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = ['(hello)']
    interpreter.execute('length')
    expect(interpreter.operand_stack.stack).toEqual([5])
  })

  test('get: should push the character at the specified index onto the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = ['(hello)', 1]
    interpreter.execute('get')
    expect(interpreter.operand_stack.stack).toEqual(['(e)'])
  })

  test('getinterval: should push a substring onto the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = ['(hello)', 1, 3]
    interpreter.execute('getinterval')
    expect(interpreter.operand_stack.stack).toEqual(['(ell)'])
  })

  test('putinterval: should replace a substring in the original string', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = ['(hello)', 1, '(abc)']
    interpreter.execute('putinterval')
    expect(interpreter.operand_stack.stack).toEqual(['(habco)'])
  })
})
