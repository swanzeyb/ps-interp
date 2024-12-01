import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('Scoping Operations', () => {
  test('Dynamic scoping: should resolve variables in the most recent scope', () => {
    const interpreter = new PostScriptInterpreter({ scoping: 'dynamic' })
    interpreter.execute('10 /x def 5 dict begin 20 /x def x')
    expect(interpreter.stack).toEqual([20])
  })

  test('Dynamic scoping: should resolve variables defined in parent scopes', () => {
    const interpreter = new PostScriptInterpreter({ scoping: 'dynamic' })
    interpreter.execute('10 /x def 5 dict begin x end')
    expect(interpreter.stack).toEqual([10])
  })

  test('Lexical scoping: should resolve variables based on the scope where the procedure is defined', () => {
    const interpreter = new PostScriptInterpreter({ scoping: 'lexical' })
    interpreter.execute('10 /x def 5 dict begin 20 /x def x')
    expect(interpreter.stack).toEqual([10])
  })

  test('Lexical scoping: should resolve variables from the defining scope even after exiting that scope', () => {
    const interpreter = new PostScriptInterpreter({ scoping: 'lexical' })
    interpreter.execute('10 /x def 5 dict begin /proc {x} def end proc')
    interpreter.execute('execute')
    expect(interpreter.stack).toEqual([10])
  })

  test('Toggle scoping: should allow switching between dynamic and lexical scoping', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.execute('10 /x def')
    interpreter.setScoping('dynamic')
    interpreter.execute('5 dict begin 20 /x def x')
    expect(interpreter.stack).toEqual([20]) // Dynamic scoping

    interpreter.setScoping('lexical')
    interpreter.execute('10 /x def 5 dict begin 20 /x def x')
    expect(interpreter.stack).toEqual([10]) // Lexical scoping
  })
})
