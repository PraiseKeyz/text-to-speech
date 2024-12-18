import React, { useState, useEffect } from 'react';
// import Contact from './components/texttospeech';
import './App.css';

function App() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [audioUrl, setAudioUrl] = useState(null); // To store the audio URL for download
  const [isRecording, setIsRecording] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const updateVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      setSelectedVoice(availableVoices[0]); // Set default voice
    };
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = updateVoices;
    }
    
    updateVoices();
  }, []);

  const handleChange = (event) => {
    setText(event.target.value);
    if (event.target.value === "") {
      setAudioUrl(null);
      setHasDownloaded(false);
    }
  };

  const handleSpeak = () => {
    if (text !== "") {
      // Create a SpeechSynthesisUtterance instance
      const speech = new SpeechSynthesisUtterance(text);
      speech.voice = selectedVoice;
      speech.rate = rate;

      // Start speaking the text
      window.speechSynthesis.speak(speech);

      // Use Web Audio API and MediaRecorder to capture audio
      startRecording(speech);
    } else {
      alert("Please enter some text to speak");
    }
  };

  const startRecording = (speech) => {
    setIsRecording(true);

    // Create an AudioContext and MediaStreamDestination to capture audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
    
    // Create an AudioNode from the SpeechSynthesisUtterance
    const audioSource = audioContext.createMediaElementSource(new Audio());
    audioSource.connect(mediaStreamDestination);

    // Capture audio when data is available
    mediaRecorder.ondataavailable = (e) => {
      const audioBlob = e.data;
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl); // Store audio URL for downloading
      setHasDownloaded(false);
    };

    mediaRecorder.start();

    // Stop recording after speech ends
    speech.onend = () => {
      mediaRecorder.stop();
      setIsRecording(false);
    };
  };


  const downloadFileName = text;
  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `${downloadFileName}.wav`;
      link.click();
      setHasDownloaded(true);
    }
  };

  return (
    <div className="App">
      <h1>Text To Speech</h1>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Type your text here"
        rows="5"
        cols="50"
      />
      <br />
      
      <label>
        Select Voice:
        <select
          value={selectedVoice ? selectedVoice.name : ""}
          onChange={(e) => {
            const voice = voices.find((voice) => voice.name === e.target.value);
            setSelectedVoice(voice);
          }}
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </label>
      <br />

      <label>
        Speech Rate:
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        {rate}
      </label>
      <br />
      
      <button onClick={handleSpeak} disabled={isRecording}>{isRecording ? 'Recording...' : 'Generate Speech'}</button>
      {!hasDownloaded && audioUrl && (
        <button onClick={handleDownload}>
          Download Speech
        </button>
      )}
      <div className='copyright'>
      <p>Developed with &#10084;&#65039; by Dev Praisekeyz.</p>
      <p>&#169; 2024</p>
      </div>

      
    </div>
  );
};

export default App;
