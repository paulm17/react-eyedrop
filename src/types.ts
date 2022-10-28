import { MutableRefObject } from "react"

export type RgbObj = {
  r: number
  g: number
  b: number
}

export type TargetRef = {
  element: HTMLElement
  rect: DOMRect
}

export interface EyeDropperProps {
  areaSelector?: string
  pixelateValue?: number
  magnifierSize?: MagnifierSize
  zoom?: number
}

export type MagnifierSize = "xs" | "sm" | "md" | "lg"

export interface MagnifierProps extends EyeDropperProps {
  active: boolean
  canvas: HTMLCanvasElement | null
  setColorCallback: any
  target: MutableRefObject<TargetRef>
}

export type OnChangeEyedrop = {
  rgb: string
  hex: string
  customProps: any
}

export type HookOptions = {
  once?: boolean
  pickRadius?: number
  cursorActive?: string
  cursorInactive?: string
  customProps?: { [key: string]: any }
  onPickStart?: () => void
  onPickEnd?: () => void
  onPickCancel?: () => void
  onChange?: (changes: OnChangeEyedrop) => void  
}

export type PickingMode = {
  isPicking: boolean,
  disableButton: boolean,
  showActiveCursor: boolean
}