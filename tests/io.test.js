import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('Input/Output Operations', () => {
  test('print: should print the top element of the stack', () => {
    const interpreter = new PostScriptInterpreter()
    let output = ''
    interpreter.outputCallback = (text) => (output += text) // Mock printing
    interpreter.stack = ['Hello, world!']
    interpreter.execute('print')
    expect(output).toBe('Hello, world!')
    expect(interpreter.stack).toEqual([]) // Optionally clear the stack after print
  })

  test('=: should print the top element of the stack and remove it', () => {
    const interpreter = new PostScriptInterpreter()
    let output = ''
    interpreter.outputCallback = (text) => (output += text) // Mock printing
    interpreter.stack = [42]
    interpreter.execute('=')
    expect(output).toBe('42')
    expect(interpreter.stack).toEqual([])
  })

  test('==: should print the top element of the stack in a human-readable format', () => {
    const interpreter = new PostScriptInterpreter()
    let output = ''
    interpreter.outputCallback = (text) => (output += text) // Mock printing
    interpreter.stack = [{ key: 'value' }]
    interpreter.execute('==')
    expect(output).toBe('{key: value}')
    expect(interpreter.stack).toEqual([])
  })
})
