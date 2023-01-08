import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import yiorgosLogo from '../assets/yiorgos-logo.png'

const Home = () => {
  const [input, setInput] = useState('')
  const [img, setImg] = useState('')

  const maxRetries = 20
  const [retry, setRetry] = useState(0)
  const [retryCount, setRetryCount] = useState(maxRetries)

  const [isGenerating, setIsGenerating] = useState(false)

  const [finalPrompt, setfinalPrompt] = useState('')

  const onInputChange = (e) => {
    setInput(e.target.value)
  }

  const generateAction = async () => {
    console.log('Generating.......')

    // Make sure there is no double click
    if (isGenerating && retry === 0) return

    // Set loading has started
    setIsGenerating(true)

    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0
        } {
          return prevState - 1
        }
      })
      setRetry(0)
    }

    const finalInput = input.replace("name", "unique_ting")

    // fetch request
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ input: finalInput })
    })

    const data = await response.json()

    // Model still loading
    if (response.status === 503) {
      setRetry(data.estimated_time)
      return
    }

    // Error
    if (!response.ok) {
      console.log(`Error: ${data.error}`)
      // Stop loading
      setIsGenerating(false)
      return
    }

    setfinalPrompt(input)
    setInput('')
    // When image is received from the API set it into state
    setImg(data.image)
    // Stop loading
    setIsGenerating(false)
  }

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Request again in 5 minutes.`)
        setRetryCount(maxRetries)
        return
      }

      console.log(`Trying again in ${retry} seconds.`)

      await sleep(retry * 1000)
      await generateAction()
    }

    if (retry === 0) {
      return
    }

    runRetry()
  }, [retry])

  return (
    <div className="root">
      <Head>
        <title>AI Avatar Generator | Yiorgos</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Yiorgos avatar generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>How do you want me to look like?</h2>
          </div>
          <div className="prompt-container">
            <input className='prompt-box' value={input} onChange={onInputChange}></input>
            <div className="prompt-buttons">
              <a className={
                isGenerating ? 'generate-button loading' : 'generate-button'
              } onClick={generateAction}>
                <div className="generate">
                  {isGenerating ? (
                    <span className='loader'></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {img && (
          <div className='output-content'>
            <Image src={img} width={512} height={512} alt={input} />
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://yiorgos-portfolio.vercel.app/"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={yiorgosLogo} width={300} height={300} alt="yiorgos logo" />
            <p>made by Yiorgos</p>
          </div>
        </a>
      </div>
    </div>
  )
}

export default Home
