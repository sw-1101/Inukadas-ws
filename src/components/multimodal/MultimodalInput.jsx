import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Chip,
  LinearProgress,
  TextField,
  Alert
} from '@mui/material';
import {
  Mic,
  MicOff,
  Send,
  PlayArrow,
  Pause,
  AudioFile,
  VideoLibrary as VideoFile,
  Image as ImageIcon,
  PictureAsPdf,
  TableChart,
  Description,
  Upload
} from '@mui/material';



const MultimodalInput= ({ onSubmit, loading = false }) => {
  const [textInput, setTextInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ファイルタイプ判定
  const detectFileType = (file) => {
    const mimeType = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || extension === 'xlsx' || extension === 'xls') return 'excel';
    if (extension === 'md' || extension === 'markdown') return 'markdown';
    
    return 'other';
  };

  // ファイルアイコン取得
  const getFileIcon = ( => {
    switch (type) {
      case 'audio': return <AudioFile />;
      case 'video': return <VideoFile />;
      case 'image': return <ImageIcon />;
      case 'pdf': return <PictureAsPdf />;
      case 'excel': return <TableChart />;
      case 'markdown': return <Description />;
      default: return <Upload />;
    }
  };

  // ファイルアップロード処理
  const handleFileUpload = ( => {
    const files = event.target.files;
    if (!files) return;

    const newFiles).map(file => {
      const type = detectFileType(file);
      let preview: string | undefined;

      // 画像のプレビュー生成
      if (type === 'image') {
        preview = URL.createObjectURL(file);
      }

      return { file, type, preview };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setError('');
  };

  // ファイル削除
  const removeFile = ( => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  };

  // 音声録音開始
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(;
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('マイクへのアクセスが拒否されました');
    }
  };

  // 音声録音停止
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 音声削除
  const removeAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }
    setAudioBlob(null);
  };

  // 音声再生/停止
  const toggleAudioPlayback = () => {
    if (!audioBlob) return;

    if (currentAudio && !currentAudio.paused) {
      // 再生中 → 停止
      currentAudio.pause();
      setIsPlaying(false);
    } else {
      // 停止中 → 再生
      if (currentAudio) {
        currentAudio.play();
        setIsPlaying(true);
      } else {
        // 新しいAudioオブジェクトを作成
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setError('音声の再生に失敗しました');
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        setCurrentAudio(audio);
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  // ファイル音声再生（アップロードされた音声ファイル用）
  const playUploadedAudio = ( => {
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.onerror = () => {
      setError('音声ファイルの再生に失敗しました');
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.play();
  };

  // ドラッグ&ドロップ処理
  const handleDrop = ( => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = { target: { files } } as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  const handleDragOver = ( => {
    event.preventDefault();
  };

  // 送信処理
  const handleSubmit = () => {
    if (!textInput.trim() && uploadedFiles.length === 0 && !audioBlob) {
      setError('テキスト、ファイル、または音声のいずれかを入力してください');
      return;
    }

    onSubmit({
      text: textInput,
      files),
      audioBlob: audioBlob || undefined,
    });

    // フォームリセット
    setTextInput('');
    setUploadedFiles([]);
    setAudioBlob(null);
    setError('');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h6" gutterBottom>
        マルチモーダル入力テスト
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* テキスト入力 */}
      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="質問やメッセージを入力してください..."
        value={textInput}
        onChange={( => setTextInput(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
      />

      {/* ファイルアップロード領域 */}
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          mb: 2,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography variant="body2" color="textSecondary" gutterBottom>
          ファイルをドロップするか、ボタンでアップロード
          <br />
          対応形式: 画像、音声、動画、PDF、Excel、Markdown
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Upload />}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          ファイル選択
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFileUpload}
          accept="image/*,audio/*,video/*,.pdf,.xlsx,.xls,.csv,.md,.markdown"
        />
      </Box>

      {/* アップロードされたファイル表示 */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            アップロードファイル:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {uploadedFiles.map((uploadedFile, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip
                  icon={getFileIcon(uploadedFile.type)}
                  label={uploadedFile.file.name}
                  onDelete={() => removeFile(index)}
                  variant="outlined"
                  disabled={loading}
                />
                {uploadedFile.type === 'audio' && (
                  <IconButton
                    size="small"
                    onClick={() => playUploadedAudio(uploadedFile.file)}
                    disabled={loading}
                    title="音声を再生"
                  >
                    <PlayArrow fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* 音声録音 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton
          color={isRecording ? 'error' : 'primary'}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
          size="large"
        >
          {isRecording ? <MicOff /> : <Mic />}
        </IconButton>
        <Typography variant="body2">
          {isRecording ? '録音中...' : '音声録音'}
        </Typography>
        {audioBlob && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<AudioFile />}
              label="録音済み音声"
              onDelete={removeAudio}
              variant="outlined"
              disabled={loading}
            />
            <IconButton
              size="small"
              onClick={toggleAudioPlayback}
              disabled={loading}
              title={isPlaying ? "再生停止" : "音声を再生"}
            >
              {isPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
            </IconButton>
          </Box>
        )}
      </Box>

      {/* 進行状況 */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* 送信ボタン */}
      <Button
        variant="contained"
        startIcon={<Send />}
        onClick={handleSubmit}
        disabled={loading}
        fullWidth
        size="large"
      >
        {loading ? '処理中...' : '送信'}
      </Button>
    </Paper>
  );
};

export default MultimodalInput;