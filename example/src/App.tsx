import * as React from 'react'
import { hot } from 'react-hot-loader'

import './App.css'
import { EyeDropper, OnChangeEyedrop, useEyeDrop } from 'react-eyedrop'
import { ChangeEvent, useEffect } from 'react'
const { useState } = React

type StateType = {
  image: File | null,
  pickedColor: {
    rgb: string,
    hex: string
  },
  eyedropOnce: boolean
}

const App = () => {
  const [state, setState] = useState<StateType>({
    image: null,
    pickedColor: {
      rgb: '',
      hex: ''
    },
    eyedropOnce: true
  })
  const { image, eyedropOnce } = state
  const [ colors, pickColor, cancelPickColor ] = useEyeDrop({
    once: eyedropOnce
  })

  const handleChangeColor = ({ rgb, hex }: OnChangeEyedrop) => {
    setState({ ...state, pickedColor: { rgb, hex } })
  }

  const handleHTMLChangeColor = ({rgb, hex}: OnChangeEyedrop) => {
    console.log(rgb)
    console.log(hex)
  }

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    if(!e.currentTarget.files) return
    const image = (e.currentTarget.files as FileList)[0]

    if (image.type && image.type.includes('image')) {
      setState({ ...state, image })
    }
  }

  const renderImage = () => (
    <div className="uploaded-image-wrapper">
      <img
        src={URL.createObjectURL(state.image as File)} />
    </div>
  )

  const swatches = [
    "#000000",
    "#808080",
    "#c0c0c0",
    "#ffffff",
    "#000080",
    "#0000ff",
    "#00ffff",
    "#008000",
    "#808000",
    "#008080",
    "#00ff00",
    "#800000",
    "#800080",
    "#af33f2",
    "#ff00ff",
    "#ff0000",
    "#f0672e",
    "#ffff00",
  ]

  const toggleOnce = () => {
    setState({ ...state, eyedropOnce: !state.eyedropOnce })
  }

  useEffect(() => {
    setState({ ...state, pickedColor: colors })
  }, [colors])

  const { rgb, hex } = state.pickedColor
  return (
    <div className="container">
      <div className="column">
        <h2 className="title">Image Example</h2>
        <div className="image-eyedropper-mode-wrapper">
          <div className="upload-image">
            {image ? (
              <div className="eyedrop-wrapper">
                <EyeDropper once={eyedropOnce} onChange={handleChangeColor}>Pick Color</EyeDropper>
                <button onClick={pickColor}>Pick Color With Hook</button>
                <p>Once: {eyedropOnce.toString()}</p>
                <button onClick={toggleOnce}>Toggle `once` prop</button>
                <div style={{ backgroundColor: rgb }} className="eyedrop-color" />
                <p style={{color: 'rgb(123, 155, 22)'}}>RGB</p>
                <p>{rgb}</p>
                <p style={{color: 'rgb(123, 155, 22)'}}>HEX</p>
                <p>{hex}</p>
              </div>
            ) : null}
            {image ? (
              renderImage()
            ) : (
              <div className="image-upload-wrapper">
                <h1>Click to upload image!</h1>
                <input className="image-upload-field" type="file" onChange={handleImage} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="column">
        <h2 className="title">HTML Magnifier Example</h2>
        <div className="html-eyedropper-mode-wrapper">
          <div className="row">
            <h2 className="subtitle">Color Palette</h2>
            <div className="palette">
              {swatches.map((swatch, index) => {
                return (
                  <div
                    key={index}
                    style={{
                      display: "block",
                      marginRight: "2px",
                      width: "40px",
                      height: "40px",
                      background: swatch,
                      color: swatch,
                    }}
                  ></div>
                )
              })}
            </div>
            <div className="html-picker">
              <EyeDropper once={eyedropOnce} isMagnifiedPicker magnifierSize="md" onChange={handleHTMLChangeColor}>Pick Color</EyeDropper>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default hot(module)(App)
