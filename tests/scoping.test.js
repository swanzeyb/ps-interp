import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('Scoping Operations', () => {
  test('Dynamic scoping: should resolve variables in the most recent scope', () => {
    const interpreter = new PostScriptInterpreter({ scoping: 'dynamic' })
    interpreter.execute('/x 10 def 5 dict begin /x 20 def x end')
    expect(interpreter.operand_stack.stack).toEqual([20])
  })

  test('Dynamic scoping: should resolve variables defined in parent scopes', () => {
    const interpreter = new PostScriptInterpreter({ scoping: 'dynamic' })
    interpreter.execute('/x 10 def 5 dict begin x end')
    expect(interpreter.operand_stack.stack).toEqual([10])
  })

  test('Lexical scoping: should resolve variables based on the scope where the procedure is defined', () => {
    const interpreter = new PostScriptInterpreter({ scoping: 'static' })
    interpreter.execute(
      '/x 10 def /proc { x } def 5 dict begin /x 20 def proc end'
    )
    expect(interpreter.operand_stack.stack).toEqual([10])
  })

  test('Toggle scoping: should allow switching between dynamic and lexical scoping', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.execute('/x 10 def')
    interpreter.set_scoping('dynamic')
    interpreter.execute('5 dict begin /x 20 def x end')
    expect(interpreter.operand_stack.stack).toEqual([20]) // Dynamic scoping

    interpreter.set_scoping('lexical')
    interpreter.execute(
      '/x 10 def /proc { x } def 5 dict begin /x 20 def proc end'
    )
    expect(interpreter.operand_stack.stack).toEqual([20]) // Lexical scoping
  })
})
