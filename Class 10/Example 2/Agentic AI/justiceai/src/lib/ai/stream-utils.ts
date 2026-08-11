const ERR_INVALID_STATE = "ERR_INVALID_STATE"

export function safeEnqueue(
  controller: ReadableStreamDefaultController<Uint8Array>,
  data: Uint8Array
): boolean {
  try {
    controller.enqueue(data)
    return true
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === ERR_INVALID_STATE) {
      return false
    }
    throw err
  }
}

export function safeClose(
  controller: ReadableStreamDefaultController<Uint8Array>
): void {
  try {
    controller.close()
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code !== ERR_INVALID_STATE) {
      throw err
    }
  }
}
