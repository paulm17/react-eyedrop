import { getCanvasBlockColors } from '../src/get-canvas-block-colors'

describe('getCanvasBlockColors should', () => {
    const canvasElement = document.createElement('canvas')
    canvasElement.width = 15
    canvasElement.height = 15
    const context = canvasElement.getContext('2d')
    // rect background color 'black' by default
    context.rect(0, 0, 15, 10)
  
  it('return a color block based on canvas', () => {
    const colorBlock = getCanvasBlockColors(canvasElement, 0, 0, 10, 10)
    expect(colorBlock[0]).toEqual({ r: 0, g: 0, b: 0 })
    expect(colorBlock[1]).toEqual({ r: 0, g: 0, b: 0 })
  })
  
  it('throw if given element is not of type canvas', () => {
    const div = document.createElement('div')
    expect(() => getCanvasBlockColors(div, 10, 10, 10, 10)).toThrow('getCanvasBlockColors: element is not of type canvas')
  })
})