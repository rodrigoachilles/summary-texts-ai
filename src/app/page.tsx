"use client";

import styles from "./page.module.css";
import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  CircularProgress,
  AppBar,
  Toolbar,
  useMediaQuery,
  Alert,
  makeStyles,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import Image from "next/image";

interface HistoryItem {
  input: string;
  summary: string;
}

const URL = "/api/summarize";

export default function Home() {
  const [messageError, setMessageError] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const theme = useTheme();

  const summarizeText = async () => {
    setLoading(true);
    setMessageError("");
    try {
      if (!inputText) {
        setMessageError("Input text cannot be empty");
        return;
      }

      setOutputText("");
      const response = await fetch(URL, {
        method: "POST",
        body: JSON.stringify({ text: inputText }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        setMessageError("Error summarizing text. Try again later");
        return;
      }

      const data = await response.json();
      setOutputText(data.summary);
      setHistory([
        { input: shortText(inputText), summary: shortText(data.summary) },
        ...history,
      ]);
    } catch (error) {
      setMessageError(`Error summarizing text: ${error}`);
    } finally {
      setLoading(false);
      setInputText("");
    }
  };

  const shortText = (text: string) => {
    var first100 = text.slice(0, 100);
    var rest = text.length > 100 ? "..." : "";
    return first100 + rest;
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <main className={styles.main}>
      <AppBar position="static">
        <Toolbar>
          <Image
            src="/summary-texts-icon.svg"
            alt="Summary Texts Logo"
            width={100}
            height={24}
            className="dark:invert"
            priority
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Summarizer Texts in Gemini
          </Typography>
        </Toolbar>
      </AppBar>
      <br />
      {messageError ? (
        <Alert variant="filled" severity="error">
          {messageError}
        </Alert>
      ) : null}
      <br />
      <Container style={{ display: "flex" }}>
        <Box width="40%" p={2} borderRight="1px solid #ccc">
          <Typography variant="h5" gutterBottom>
            History
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ClearIcon />}
            onClick={clearHistory}
          >
            Clear
          </Button>
          <ul>
            {history.map((item, index) => (
              <li key={index}>
                <Typography variant="body1">
                  <strong>Input:</strong> {item.input}
                </Typography>
                <Typography variant="body1">
                  <strong>Summary:</strong> {item.summary}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>
        <Box width="60%" p={2}>
          <TextField
            fullWidth
            variant="outlined"
            multiline
            rows={10}
            placeholder="Paste or type your text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={summarizeText}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Summarize"}
            </Button>
          </Box>
          <Box mt={2}>
            <TextField
              fullWidth
              variant="outlined"
              multiline
              rows={10}
              placeholder="Summary..."
              value={outputText}
            />
          </Box>
        </Box>
      </Container>
    </main>
  );
}
