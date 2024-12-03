import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('Input/Output Operations', () => {
  const output = console.log
  let outputData = ''

  beforeEach(() => {
    outputData = ''
  })

  beforeAll(() => {
    console.log = (text) => (outputData += text)
  })

  afterAll(() => {
    console.log = output
  })

  test('print: should print the top element of the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = ['(Hello, world!)']
    interpreter.execute('print')
    expect(outputData).toBe('Hello, world!')
    expect(interpreter.operand_stack.stack).toEqual([])
  })

  test('= should print the top element of the stack and remove it', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [42]
    interpreter.execute('=')
    expect(outputData).toBe('42')
    expect(interpreter.operand_stack.stack).toEqual([])
  })

  test('== should print the top element of the stack in a human-readable format', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [{ key: 'value' }]
    interpreter.execute('==')
    expect(outputData).toBe('{\n  "key": "value"\n}')
    expect(interpreter.operand_stack.stack).toEqual([])
  })
})
