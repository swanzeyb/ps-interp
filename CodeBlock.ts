export default class CodeBlock {
  code: string
  lexical_env: { [key: string]: any }

  constructor(code: string, lexical_env: { [key: string]: any }) {
    this.code = code
    this.lexical_env = lexical_env
  }
}
