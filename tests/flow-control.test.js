import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('Flow Control Operations', () => {
  test('if: should execute the block if the condition is true', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [true, '{ 2 3 add }']
    interpreter.execute('if')
    expect(interpreter.operand_stack.stack).toEqual([5])
  })

  test('if: should not execute the block if the condition is false', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [false, '{ 2 3 add }']
    interpreter.execute('if')
    expect(interpreter.operand_stack.stack).toEqual([])
  })

  test('ifelse: should execute the first block if the condition is true', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [true, '{ 2 3 add }', '{ 4 5 mul }']
    interpreter.execute('ifelse')
    expect(interpreter.operand_stack.stack).toEqual([5])
  })

  test('ifelse: should execute the second block if the condition is false', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [false, '{ 2 3 add }', '{ 4 5 mul }']
    interpreter.execute('ifelse')
    expect(interpreter.operand_stack.stack).toEqual([20])
  })

  test('for: should iterate over the range and execute the block', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [1, 1, 3, '{ dup }']
    interpreter.execute('for')
    expect(interpreter.operand_stack.stack).toEqual([1, 1, 2, 2, 3, 3])
  })

  test('repeat: should execute the block a specified number of times', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [3, '{ 2 3 add }']
    interpreter.execute('repeat')
    expect(interpreter.operand_stack.stack).toEqual([5, 5, 5])
  })
})
