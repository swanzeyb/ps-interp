export default class TokenStream {
  public tokens: string[]
  private index: number

  constructor(tokens: string[]) {
    this.tokens = tokens
    this.index = 0
  }

  peek() {
    return this.tokens[this.index]
  }

  advance() {
    return this.tokens[this.index++]
  }

  *next() {
    while (this.index < this.tokens.length) {
      yield this.tokens[this.index++]
    }
  }

  eof() {
    return this.index >= this.tokens.length
  }
}
