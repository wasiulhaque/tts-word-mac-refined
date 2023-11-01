import * as React from "react";
import PropTypes from "prop-types";
import Header from "./Header";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import bnAnsiToUnicode from "bn-ansi-to-unicode";
import Button from "@mui/material/Button";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SequentialAudioPlayer from "./SequentialAudioPlayer";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import StopOutlinedIcon from "@mui/icons-material/StopOutlined";
import { BorderAll } from "@mui/icons-material";

const containerStyle = {
  backgroundColor: "white",
  minHeight: "100vh",
};

const theme = createTheme({
  palette: {
    accent: {
      main: "#389E0D",
      dark: "389E0D",
      contrastText: "#fff",
    },
    secondary: {
      main: "#F5222D",
      dark: "#F5222D",
      contrastText: "#fff",
    },
    download: {
      main: "#136EE5",
      dark: "#136EE5",
      contrastText: "#fff",
    },
    pause: {
      main: "#7CB305",
      dark: "#7CB305",
      contrastText: "#fff",
    },
    stop: {
      main: "#CF1322",
      dark: "#CF1322",
      contrastText: "#fff",
    },
  },
  overrides: {
    MuiButton: {
      root: {
        "&:hover": {
          backgroundColor: "#fff", // Change this to your desired hover color
        },
      },
    },
  },
});

let MAX_WORD_COUNT = 20;
let MAX_TIMEOUT_RETRY = 5;

/**
 * Values for the sliders
 */
const ranges = [
  {
    value: -2,
    label: "-২x",
  },
  {
    value: -1,
    label: "-১x",
  },
  {
    value: 0,
    label: "০x",
  },
  {
    value: 1,
    label: "১x",
  },
  {
    value: 2,
    label: "২x",
  },
];

function valuetext(value) {
  return `${value}°C`;
}

export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      listItems: [],
      type: null,
      format: "unicode",
      gender: "Male",
      age: null,
      speed: 0,
      pitch: 0,
      responseAudio: null,
      playableAudio: null,
      textToPlay: null,
      downloadActivate: false,
      currentlyPlaying: false,
    };
  }

  componentDidMount() {
    this.setState({
      listItems: [],
    });
  }

  /**
   * Handler for Type Button
   * Chooses between TEXT and SSML
   */
  handleTypeButton = (event, newType) => {
    this.setState({ type: newType });
    this.type = newType;
    console.log(newType);
  };

  /**
   * Handler for Format Button
   * Chooses between ANSI and UNICODE
   */
  handleFormatButton = (event, newFormat) => {
    this.setState({ format: newFormat });
    this.format = newFormat;
    console.log(this.format);
    if (this.format == "ansi") {
      this.convertAllTextToUnicode()
        .then((selectedText) => {
          this.textToPlay = selectedText;
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (this.format == "unicode") {
      this.grabAllText()
        .then((selectedText) => {
          this.textToPlay = selectedText;
          console.log(this.textToPlay);
          var size = this.textToPlay.length;
          console.log(size);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  /**
   * Handler for Gender Radio Button
   * Chooses between পুরুষ and নারী
   */
  handleGenderChange = (event) => {
    this.setState({ gender: event.target.value });
    this.gender = event.target.value;
    console.log(this.gender);
  };

  /**
   * Handler for Age Radio Button
   * Chooses between  and SSML
   */
  handleAgeChange = (event) => {
    this.setState({ age: event.target.value });
    this.age = event.target.value;
    console.log(this.age);
  };

  /**
   * Handler for গতি Slider
   */
  handleSpeedChange = (event, newValue) => {
    this.setState({ speed: newValue });
    this.speed = newValue;
    console.log(this.speed);
  };

  /**
   * Handler for পিচ Slider
   */
  handlePitchChange = (event) => {
    this.setState({ pitch: event.target.value });
    this.pitch = event.target.value;
    console.log(this.pitch);
  };

  /**
   * Button handler for Clear Button
   * Clears all the text from the active document
   */
  handleClearButton = () => {
    Word.run(function (context) {
      // Get the current selection
      var body = context.document.body;

      // Clear the selection
      body.clear();

      // Sync the document changes
      return context.sync();
    }).catch(function (error) {
      console.log("Error:", error);
    });
  };

  handleDownload = () => {
    const blob = new Blob([this.responseAudios], { type: "audio/wav" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "audio.wav";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Grabs all the text from the active document
   */
  grabAllText = async () => {
    return new Promise((resolve, reject) => {
      Word.run(async (context) => {
        var body = context.document.body;
        context.load(body, "text");
        await context.sync();

        const allText = body.text;

        resolve(allText);
      }).catch((error) => {
        console.log("Error:", error);
        reject(error);
      });
    });
  };

  /**
   * Converts ansi text to unicode
   * @returns unicode string
   */
  convertAllTextToUnicode = async () => {
    return Word.run(async (context) => {
      var body = context.document.body;
      context.load(body, "text");
      return await context
        .sync()
        .then(function () {
          var allText = body.text;
          console.log(bnAnsiToUnicode(allText));
          if (this.format == "ansi") {
            return bnAnsiToUnicode(selectedText);
          } else if (this.format == "unicode") {
            return selectedText;
          }
        })
        .catch(function (error) {
          console.log("Error: ", error);
        });
    });
  };

  /**
   * Takes the text from the text, chunks it in the necessary manner, sends the chunks to the server
   * Recieves the response from the server and plays the audios synchronously
   */
  processTextAndPlayAudio = async () => {
    if (this.currentlyPlaying == true) {
      console.log("Already playing");
      // return;
    } else if (this.gender == null || this.format == null) {
      this.gender = "Male";
      this.format = "unicode";
    }
    this.textToPlay = null;
    await this.grabAllText()
      .then((selectedText) => {
        if (this.format == "ansi") {
          this.textToPlay = bnAnsiToUnicode(selectedText);
        } else {
          this.textToPlay = selectedText;
        }
      })
      .catch((error) => {
        console.log(error);
      });

    const chunks = this.textToPlay.split(/[\r\n।?!,;—:`’‘']+/gi).filter((token) => token.trim() != "");
    console.log(chunks);

    /**
     * Takes sentence that has more words than MAX_WORD_COUNT
     * And chunks them accordingly
     * @param {string} words
     * @param {int} maxWords
     * @returns {string} wordChunks[]
     */
    const splitLongWords = (words, maxWords) => {
      const wordChunks = [];
      let currentWordChunk = "";

      for (const word of words) {
        if ((currentWordChunk + word).split(" ").length <= maxWords) {
          currentWordChunk += word + " ";
        } else {
          if (currentWordChunk !== "") {
            wordChunks.push(currentWordChunk.trim());
            currentWordChunk = "";
          }
          wordChunks.push(word);
        }
      }

      if (currentWordChunk !== "") {
        wordChunks.push(currentWordChunk.trim());
      }
      return wordChunks;
    };

    /**
     * playing: Determines if the player is currently running
     * finishedPlaying: Determines if the player has finished playing all the chunks
     * responseAidios[]: Catches all the response audio files from the servers and stores according to index
     */

    let playing = false;
    let finishedPlaying = false;
    let playerIndex = 0;
    const responseAudios = [];

    /**
     * Takes the current index of the chunks upto which the audio has been played
     * @param {int} index
     */
    const playSequentially = async (index) => {
      for (playerIndex = index; playerIndex < responseAudios.length; playerIndex++) {
        await new Promise((resolve) => {
          // if (playing == true) {
          //   responseAudios[playerIndex].pause();
          //   playing = false;
          //   console.log("Paused");
          // } else {
          playing = true;
          responseAudios[playerIndex].onended = resolve;
          responseAudios[playerIndex].play();
          // }
        });
      }
    };

    /**
     * If playing is not started yet, it starts playing from the first index
     * If playing is interrupted, it starts playing from the chunk it got interrupted from
     */
    const playNextChunk = async () => {
      if (this.currentlyPlaying == true) {
        console.log("Already playing");
        // return;
      } else {
        this.setState({ currentlyPlaying: true, downloadActivate: false });
      }
      if (responseAudios !== "" && !playing) {
        playSequentially(0);
      } else if (playerIndex !== 0 && !finishedPlaying) {
        playSequentially(playerIndex);
      }

      if (chunks.length > 0) {
        const chunk = chunks.shift();
        const words = chunk.trim().split(" ");
        console.log(words.length);

        if (words.length > MAX_WORD_COUNT) {
          const wordChunks = splitLongWords(words, MAX_WORD_COUNT);
          for (const wordChunk of wordChunks) {
            const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                module: "backend_tts",
                submodule: "infer",
                text: chunk,
              }),
            };

            let retryCount = 0;
            let response = null;
            while (retryCount < MAX_TIMEOUT_RETRY) {
              try {
                response = await fetch("https://stt.bangla.gov.bd:9381/utils/", requestOptions);
                if (response.ok) {
                  break;
                }
              } catch (error) {
                console.log(error);
              }
              retryCount++;
            }

            if (response && response.ok) {
              console.log("Response received.");
              console.log(requestOptions);
              // const data = await response.json();
              // this.responseAudio = data.output;
              // this.playableAudio = new Audio("data:audio/wav;base64," + this.responseAudio);
              // responseAudios.push(this.playableAudio);
              this.playableAudio = new Audio(URL.createObjectURL(await response.blob()));
              //this.playableAudio.play();
              responseAudios.push(this.playableAudio);
            } else {
              console.log("Request failed.");
            }
          }
        } else {
          console.log(chunk);
          const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              module: "backend_tts",
              submodule: "infer",
              text: chunk,
            }),
          };

          let retryCount = 0;
          let response = null;
          while (retryCount < MAX_TIMEOUT_RETRY) {
            try {
              response = await fetch("https://stt.bangla.gov.bd:9381/utils/", requestOptions);
              if (response.ok) {
                break;
              }
            } catch (error) {
              console.log(error);
            }
            retryCount++;
          }

          if (response && response.ok) {
            console.log("Response received.");
            console.log(requestOptions);
            // const data = await response.json();
            // this.responseAudio = data.output;
            // this.playableAudio = new Audio("data:audio/wav;base64," + this.responseAudio);
            // responseAudios.push(this.playableAudio);
            this.playableAudio = new Audio(URL.createObjectURL(await response.blob()));
            //this.playableAudio.play();
            responseAudios.push(this.playableAudio);
          } else {
            console.log("Request failed.");
          }
        }

        await playNextChunk();
      }
    };

    await playNextChunk();

    finishedPlaying = true;
    this.setState({ downloadActivate: true, currentlyPlaying: false });
    downloadActivate = true;
    currentlyPlaying = false;
  };

  render() {
    const { type, format, gender, downloadActivate, currentlyPlaying } = this.state;

    return (
      <ThemeProvider theme={theme}>
        <div style={containerStyle}>
          <div className="ms-welcome__main">
            <Header logo={require("./../../../assets/logo-filled.png")} title={this.props.title} />
            {/* <div className="button-container">
          <ToggleButtonGroup value={type} exclusive onChange={this.handleTypeButton}>
            <ToggleButton value="text" aria-label="TEXT" className="ms-welcome__action ms-button-uniform">
              TEXT
            </ToggleButton>
            <ToggleButton value="ssml" aria-label="SSML" className="ms-welcome__action ms-button-uniform">
              SSML
            </ToggleButton>
          </ToggleButtonGroup>
        </div> */}

            <div className="square">
              <div className="caption">অক্ষরসেট</div>
              <div className="button-container">
                <ToggleButtonGroup value={format} exclusive onChange={this.handleFormatButton}>
                  <ToggleButton
                    value="ansi"
                    aria-label="ANSI"
                    className="ms-welcome__action ms-button-uniform"
                    style={{
                      height: "40px",
                      color: format === "ansi" ? "white" : "black",
                      backgroundColor: format === "ansi" ? "#006def" : "inherit",
                      borderTopLeftRadius: "8px",
                      borderBottomLeftRadius: "8px",
                      width: "80px",
                    }}
                  >
                    ANSI
                  </ToggleButton>
                  <ToggleButton
                    value="unicode"
                    aria-label="UNICODE"
                    className="ms-welcome__action ms-button-uniform"
                    style={{
                      height: "40px",
                      color: format === "unicode" ? "white" : "black",
                      backgroundColor: format == "unicode" ? "#006def" : "inherit",
                      borderTopRightRadius: "8px",
                      borderBottomRightRadius: "8px",
                      width: "80px",
                    }}
                  >
                    UNICODE
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </div>

            <div className="square" style={{ marginTop: "30px", marginBottom: "20px" }}>
              <div className="caption">কন্ঠ</div>
              <div className="button-container">
                <ToggleButtonGroup value={gender} exclusive onChange={this.handleGenderChange}>
                  <ToggleButton
                    value="Male"
                    aria-label="পুরুষ"
                    className="ms-welcome__action ms-button-uniform"
                    style={{
                      height: "40px",
                      color: gender === "Male" ? "white" : "black",
                      backgroundColor: gender === "Male" ? "#006def" : "inherit",
                      borderTopLeftRadius: "8px",
                      borderBottomLeftRadius: "8px",
                      width: "80px",
                    }}
                  >
                    পুরুষ
                  </ToggleButton>
                  <ToggleButton
                    value="Female"
                    aria-label="নারী"
                    className="ms-welcome__action ms-button-uniform"
                    style={{
                      height: "40px",
                      color: gender === "Female" ? "white" : "black",
                      backgroundColor: gender == "Female" ? "#006def" : "inherit",
                      borderTopRightRadius: "8px",
                      borderBottomRightRadius: "8px",
                      width: "80px",
                    }}
                  >
                    নারী
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </div>
            {/* <div className="button-container">
          <RadioGroup row aria-labelledby="radio-buttons-group-gender-label" name="radio-buttons-group-gender">
            <FormControlLabel value="Male" control={<Radio />} label="পুরুষ" onChange={this.handleGenderChange} />
            <FormControlLabel value="Female" control={<Radio />} label="নারী" onChange={this.handleGenderChange} />
          </RadioGroup>
        </div>

        <div className="button-container">
          <RadioGroup row aria-labelledby="radio-buttons-group-gender-label" name="radio-buttons-group-gender">
            <FormControlLabel value="adult" control={<Radio />} label="প্রাপ্তবয়স্ক" onChange={this.handleAgeChange} />
            <FormControlLabel value="child" control={<Radio />} label="অপ্রাপ্তবয়স্ক" onChange={this.handleAgeChange} />
          </RadioGroup>
        </div> */}

            {/* <div>
            <Box sx={{ width: 200 }} className="button-container">
              <Typography id="speed-slider" gutterBottom>
                গতি
              </Typography>
              <Slider
                track={false}
                max={2}
                min={-2}
                aria-label="Always visible"
                defaultValue={0}
                getAriaValueText={valuetext}
                step={1}
                marks={ranges}
                valueLabelDisplay="off"
                onChange={this.handleSpeedChange}
              />
            </Box>
          </div> */}

            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
                <Typography id="speed-slider">গতি</Typography>
                <FormControl sx={{ m: 1, minWidth: 80, minHeight: 30 }} size="small">
                  <Select
                    value={this.speed}
                    defaultValue={0}
                    onChange={this.handleSpeedChange}
                    inputProps={{ "aria-label": "Without label" }}
                  >
                    <MenuItem value={-2}>-২x</MenuItem>
                    <MenuItem value={-1}>-১x</MenuItem>
                    <MenuItem value={0}>০x</MenuItem>
                    <MenuItem value={1}>১x</MenuItem>
                    <MenuItem value={2}>২x</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                <Typography id="speed-slider">পিচ</Typography>
                <FormControl sx={{ m: 1, minWidth: 80, minHeight: 30 }} size="small">
                  <Select
                    defaultValue={0}
                    value={this.speed}
                    onChange={this.handlePitchChange}
                    inputProps={{ "aria-label": "Without label" }}
                  >
                    <MenuItem value="-2">-২x</MenuItem>
                    <MenuItem value={-1}>-১x</MenuItem>
                    <MenuItem value={0}>০x</MenuItem>
                    <MenuItem value={1}>১x</MenuItem>
                    <MenuItem value={2}>২x</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            {/* <div>
            <Box sx={{ width: 200 }} className="button-container">
              <Typography id="pitch-slider" gutterBottom>
                পিচ
              </Typography>
              <Slider
                track={false}
                max={2}
                min={-2}
                aria-label="Always visible"
                defaultValue={0}
                getAriaValueText={valuetext}
                step={1}
                marks={ranges}
                valueLabelDisplay="off"
                onChange={this.handlePitchChange}
              />
            </Box>
          </div> */}

            <div className="button-container-bottom" style={{ alignItems: "center" }}>
              <div className="left-buttons">
                <Button
                  variant="contained"
                  size="large"
                  onClick={this.processTextAndPlayAudio}
                  color={currentlyPlaying == false ? "accent" : "pause"}
                  style={{ borderRadius: "8px", height: "40px", width: "100px" }}
                >
                  {currentlyPlaying == false ? <PlayArrowOutlinedIcon /> : "Loading"}
                  {/* {currentlyPlaying == false ? "Play" : "Pause"} */}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={this.handleClearButton}
                  color="stop"
                  style={{ borderRadius: "8px", height: "40px", width: "100px" }}
                >
                  <StopOutlinedIcon />
                  {/* Clear */}
                </Button>
              </div>
              <Button
                variant="contained"
                size="small"
                onClick={this.handleDownload}
                color="download"
                style={{ borderRadius: "8px", height: "40px", width: "100px" }}
                disabled={!downloadActivate}
              >
                <FileDownloadOutlinedIcon />
                {/* ডাউনলোড */}
              </Button>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }
}

App.propTypes = {
  title: PropTypes.string,
  isOfficeInitialized: PropTypes.bool,
};
