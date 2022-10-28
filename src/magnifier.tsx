import { useEffect, useRef, useState } from "react"
import { MagnifierProps } from "./types"
import {
  isDescendant,
  isMouseMovingOut,
  getColorFromMousePosition,
  getSyncedPosition,
  pixelateCanvas,
  setUpMagnifier,
} from "./magnifierUtils/MagnifierUtil"

import {
  DEFAULT_MAGNIFIER_SIZE,
  DEFAULT_PIXELATE_VALUE,
  DEFAULT_ZOOM_AMOUNT,
  PIXEL_BOX_MULTIPLIER,
  PIXEL_BOX_OFFSET,
  PIXELATE_THRESHOLD,
  ZOOM_THRESHOLD,
} from "./constants/constants"

const Magnifier = (props: MagnifierProps) => {
  const {
    active,
    canvas,
    magnifierSize: size = DEFAULT_MAGNIFIER_SIZE,
    setColorCallback,
    target,
  } = props
  let { pixelateValue = DEFAULT_PIXELATE_VALUE, zoom = DEFAULT_ZOOM_AMOUNT } =
    props
  zoom = zoom > ZOOM_THRESHOLD ? ZOOM_THRESHOLD : zoom
  pixelateValue =
    pixelateValue > PIXELATE_THRESHOLD ? PIXELATE_THRESHOLD : pixelateValue
  const pixelBoxSize = PIXEL_BOX_MULTIPLIER * pixelateValue + PIXEL_BOX_OFFSET
  const magnifierSizes = { xs: 50, sm: 75, md: 100, lg: 150 }
  const initialPosition = {
    top: -1 * magnifierSizes[size],
    left: -1 * magnifierSizes[size],
  }
  const magnifierRef = useRef<HTMLDivElement>(document.createElement("div"))
  const magnifierContentRef = useRef<HTMLDivElement>(
    document.createElement("div"),
  )
  const [magnifierPos, setMagnifierPos] = useState({ ...initialPosition })
  const [magnifierContentPos, setMagnifierContentPos] = useState({
    top: 0,
    left: 0,
  })
  const [magnifierContentDimension, setMagnifierContentDimension] = useState({
    width: 0,
    height: 0,
  })
  const [magnifierDisplay, setMagnifierDisplay] = useState("none")

  const prepareContent = () => {
    const magnifier = magnifierRef.current
    const magnifierContent = magnifierContentRef.current
    setUpMagnifier(magnifier, magnifierContent)
    if (!target.current.rect) {
      return
    }
    const {
      rect: { height, width },
    } = target.current
    setMagnifierContentDimension({ width, height })
    if (canvas) {
      magnifierContent.appendChild(canvas)
      const image = new Image()
      image.src = canvas.toDataURL()
      image.onload = pixelateCanvas.bind(null, image, canvas, pixelateValue)
    }
  }

  const syncViewport = () => {
    const { left, top } = getSyncedPosition(
      magnifierRef.current,
      target.current.rect,
      magnifierSizes[size],
      zoom,
    )
    setMagnifierContentPos({
      top,
      left,
    })
  }

  const syncScrollBars = (e: any) => {
    const ownerDocument = magnifierRef.current.ownerDocument
    if (e && e.target) {
      syncScroll(e.target)
    } else {
      const elements = ownerDocument && ownerDocument.querySelectorAll("div")
      const scrolled: any = Array.prototype.reduce.call(
        elements,
        (acc: any, element) => {
          element.scrollTop > 0 && acc.push(element)
          return acc
        },
        [],
      )

      scrolled.forEach((scrolledElement: any) => {
        !isDescendant(magnifierRef.current, scrolledElement) &&
          syncScroll(scrolledElement)
      })
    }
  }

  const syncScroll = (ctrl: any) => {
    const selectors = [] as string[]
    if (ctrl.getAttribute) {
      ctrl.getAttribute("id") && selectors.push("#" + ctrl.getAttribute("id"))
      ctrl.className &&
        selectors.push("." + ctrl.className.split(" ").join("."))

      const t = ctrl.ownerDocument.body.querySelectorAll(selectors[0])
      t[0].scrollTop = ctrl.scrollTop
      t[0].scrollLeft = ctrl.scrollLeft
      return true
    } else if (ctrl === document) {
      syncViewport()
    }
    return false
  }

  const syncContent = () => {
    prepareContent()
    syncViewport()
    syncScrollBars({})
  }

  const moveHandler = (e: any) => {
    const { clientX, clientY } = e
    if (!isMouseMovingOut(e, target.current.rect)) {
      const left1 = clientX - magnifierSizes[size] / 2
      const top1 = clientY - magnifierSizes[size] / 2
      setMagnifierPos({
        top: top1,
        left: left1,
      })
      syncViewport()
    }
  }

  const makeDraggable = () => {
    const dragHandler = magnifierRef.current as HTMLElement
    const currentWindow: any = dragHandler.ownerDocument.defaultView

    currentWindow.addEventListener("mousemove", moveHandler)
    currentWindow.addEventListener("resize", syncContent, false)
    currentWindow.addEventListener("scroll", syncScrollBars, true)
  }

  const getColorFromCanvas = (e: any) => {
    const hex = getColorFromMousePosition(
      e,
      magnifierRef.current,
      target.current.rect,
      size,
    )
    setColorCallback(hex)
    setMagnifierPos({ ...initialPosition })
  }

  useEffect(() => {
    const currentWindow: any = magnifierRef.current.ownerDocument.defaultView
    if (active && canvas && target.current) {
      prepareContent()
      setMagnifierDisplay("block")
      makeDraggable()
      syncViewport()
      syncScrollBars({})
    } else {
      setMagnifierPos({ ...initialPosition })
      setMagnifierDisplay("none")
    }
    return () => {
      currentWindow.removeEventListener("mousemove", moveHandler)
      currentWindow.removeEventListener("resize", syncContent, false)
      currentWindow.removeEventListener("scroll", syncScrollBars, true)
    }
  }, [active, canvas, target])

  return active ? (
    <div
      ref={magnifierRef}
      className="magnifier"
      style={{
        backgroundColor: "#fff",
        border: "2px solid #ccc",
        borderRadius: "50%",
        overflow: "hidden",
        position: "fixed",
        zIndex: 100000,
        display: magnifierDisplay,
        height: `${magnifierSizes[size]}px`,
        left: `${magnifierPos.left}px`,
        top: `${magnifierPos.top}px`,
        width: `${magnifierSizes[size]}px`,
      }}
    >
      <div
        ref={magnifierContentRef}
        className="magnifier-content"
        style={{
          display: "block",
          marginLeft: "0px",
          marginTop: "0px",
          overflow: "visible",
          paddingTop: "0px",
          position: "absolute",
          transformOrigin: "left top",
          userSelect: "none",
          height: `${magnifierContentDimension.height}px`,
          left: `${magnifierContentPos.left}px`,
          top: `${magnifierContentPos.top}px`,
          transform: `scale(${zoom})`,
          width: `${magnifierContentDimension.width}px`,
        }}
      ></div>
      <div
        onClick={getColorFromCanvas}
        className="magnifier-glass"
        style={{
          alignItems: "center",
          backgroundImage:
            "linear-gradient(to right, gray 1px, transparent 1px), linear-gradient(to bottom, gray 1px, transparent 1px)",
          backgroundPosition: "center",
          cursor: "none",
          display: "grid",
          height: "100%",
          justifyContent: "center",
          left: "0px",
          opacity: 1,
          position: "absolute",
          top: "0px",
          width: "100%",
          backgroundSize: `${pixelBoxSize}px ${pixelBoxSize}px`,
        }}
      >
        <svg
          className="cursor-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          width={pixelBoxSize}
          height={pixelBoxSize}
          style={{
            border: "2px solid #fff",
            boxShadow: "inset 0 0 0 1px #000",
            margin: "0 auto",
            position: "relative",
          }}
        ></svg>
      </div>
    </div>
  ) : (
    <div ref={magnifierRef}></div>
  )
}

export default Magnifier
