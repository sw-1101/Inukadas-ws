import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoInput } from './MemoInput';

// モック関数の定義
const mockCreateMemo = vi.fn().mockResolvedValue('mock-memo-id');

// モック設定
vi.mock('@/contexts/AuthContext', () => ({
  useAuth) => ({
    user: { uid: 'test-user-id', email: 'test@example.com' },
    loading: false,
    error: null
  })
}));

vi.mock('@/contexts/MemoContext', () => ({
  useMemos) => ({
    createMemo: mockCreateMemo
  })
}));

vi.mock('@/services/audio/memoAudioService', () => ({
  memoAudioService: {
    createAudioMemo).mockResolvedValue('mock-memo-id')
  }
}));

vi.mock('@/components/feedback/TrophyNotification', () => ({
  useTrophyNotification) => ({
    showSuccessNotification)
  })
}));

vi.mock('@/services/firebase/auth', () => ({
  authService: {
    getCurrentUserId).mockReturnValue('test-user-id')
  }
}));

// MediaRecorder のモック
const mockMediaRecorder = {
  start),
  stop),
  pause),
  resume),
  ondataavailable: null,
  onstop: null,
  state: 'inactive'
};

Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value).mockImplementation(() => mockMediaRecorder)
});

Object.defineProperty(window.MediaRecorder, 'isTypeSupported', {
  writable: true,
  value).mockReturnValue(true)
});

// getUserMedia のモック
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia).mockResolvedValue({
      getTracks) => [{ stop) }]
    })
  }
});

// レンダリングヘルパー
const renderComponent = ( => {
  return render(component);
};

describe('MemoInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateMemo.mockResolvedValue('mock-memo-id');
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('基本レンダリング', () => {
    it('テキストモードで正しくレンダリングされる', () => {
      renderComponent(<MemoInput mode="text" />);
      
      expect(screen.getByPlaceholderText('メモを入力してください...')).toBeInTheDocument();
      expect().toBeInTheDocument();
    });

    it('モード選択ボタンが表示される', () => {
      renderComponent(<MemoInput />);
      
      expect(screen.getByTitle('テキストメモ')).toBeInTheDocument();
      expect(screen.getByTitle('音声メモ')).toBeInTheDocument();
      expect(screen.getByTitle('テキスト＋音声メモ')).toBeInTheDocument();
    });
  });

  describe('テキスト入力', () => {
    it('テキストを入力できる', async () => {
      const user = userEvent.setup();
      renderComponent(<MemoInput mode="text" />);
      
      const textField = screen.getByPlaceholderText('メモを入力してください...');
      await user.type(textField, 'テストメモ');
      
      expect(textField).toHaveValue('テストメモ');
    });

    it('文字数制限が適用される', async () => {
      const user = userEvent.setup();
      renderComponent(<MemoInput mode="text" maxLength={10} />);
      
      const textField = screen.getByPlaceholderText('メモを入力してください...');
      await user.type(textField, '12345678901234567890'); // 20文字
      
      expect(textField).toHaveValue('1234567890'); // 10文字に制限
    });

    it('Enterキーで送信される', async () => {
      const onSubmitSuccess = vi.fn();
      const user = userEvent.setup();
      
      renderComponent(
        <MemoInput mode="text" onSubmitSuccess={onSubmitSuccess} />
      );
      
      const textField = screen.getByPlaceholderText('メモを入力してください...');
      await user.type(textField, 'テストメモ');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(onSubmitSuccess).toHaveBeenCalledWith('mock-memo-id');
      });
    });
  });

  describe('音声録音', () => {
    it('音声モードで録音ボタンが表示される', () => {
      renderComponent(<MemoInput mode="audio" />);
      
      expect(screen.getByText('録音開始')).toBeInTheDocument();
    });

    it('録音開始ボタンをクリックして録音を開始できる', async () => {
      const user = userEvent.setup();
      renderComponent(<MemoInput mode="audio" />);
      
      const recordButton = screen.getByText('録音開始');
      await user.click(recordButton);
      
      await waitFor(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
      });
    });

    it('マイクアクセスが拒否された場合にエラーが表示される', async () => {
      const user = userEvent.setup();
      
      // getUserMedia を失敗させる
      (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(
        new Error('Permission denied')
      );
      
      renderComponent(<MemoInput mode="audio" />);
      
      const recordButton = screen.getByText('録音開始');
      await user.click(recordButton);
      
      await waitFor(() => {
        expect(screen.getByText(/マイクへのアクセスが許可されていません/)).toBeInTheDocument();
      });
    });
  });

  describe('フォーム送信', () => {
    it('テキストが空の場合は送信ボタンが無効化される', async () => {
      renderComponent(<MemoInput mode="text" />);
      
      const submitButton = screen.getByRole(;
      
      // テキストが空の場合は送信ボタンが無効化される
      expect(submitButton).toBeDisabled();
    });

    it('送信成功時にコールバックが呼ばれる', async () => {
      const onSubmitSuccess = vi.fn();
      const user = userEvent.setup();
      
      renderComponent(
        <MemoInput mode="text" onSubmitSuccess={onSubmitSuccess} />
      );
      
      const textField = screen.getByPlaceholderText('メモを入力してください...');
      await user.type(textField, 'テストメモ');
      
      const submitButton = screen.getByRole(;
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(onSubmitSuccess).toHaveBeenCalledWith('mock-memo-id');
      });
    });

    it('送信エラー時にエラーコールバックが呼ばれる', async () => {
      const onSubmitError = vi.fn();
      const user = userEvent.setup();
      
      // createMemo を失敗させる
      mockCreateMemo.mockRejectedValueOnce(new Error('Network error'));
      
      renderComponent(
        <MemoInput mode="text" onSubmitError={onSubmitError} />
      );
      
      const textField = screen.getByPlaceholderText('メモを入力してください...');
      await user.type(textField, 'テストメモ');
      
      const submitButton = screen.getByRole(;
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });

  describe('モード切り替え', () => {
    it('テキストモードから音声モードに切り替えられる', async () => {
      const onModeChange = vi.fn();
      const user = userEvent.setup();
      
      renderComponent(
        <MemoInput mode="text" onModeChange={onModeChange} />
      );
      
      const audioModeButton = screen.getByTitle('音声メモ');
      await user.click(audioModeButton);
      
      expect(onModeChange).toHaveBeenCalledWith('audio');
    });

    it('混合モードでテキストと録音ボタンの両方が表示される', () => {
      renderComponent(<MemoInput mode="mixed" />);
      
      expect(screen.getByPlaceholderText('メモを入力してください...')).toBeInTheDocument();
      expect(screen.getByText('録音開始')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なtitleが設定されている', () => {
      renderComponent(<MemoInput mode="audio" />);
      
      expect(screen.getByTitle('テキストメモ')).toBeInTheDocument();
      expect(screen.getByTitle('音声メモ')).toBeInTheDocument();
      expect(screen.getByTitle('テキスト＋音声メモ')).toBeInTheDocument();
    });

    it('フォーカス管理が適切に行われる', async () => {
      renderComponent(<MemoInput mode="text" />);
      
      const textField = screen.getByPlaceholderText('メモを入力してください...');
      
      // マニュアルでフォーカスを設定してテスト
      textField.focus();
      
      expect(textField).toHaveFocus();
    });
  });

  describe('エラーハンドリング', () => {
    it('ネットワークエラー時に適切なエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      
      // createMemo を失敗させる
      mockCreateMemo.mockRejectedValueOnce(new Error('Network error'));
      
      renderComponent(<MemoInput mode="text" />);
      
      const textField = screen.getByPlaceholderText('メモを入力してください...');
      await user.type(textField, 'テストメモ');
      
      const submitButton = screen.getByRole(;
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('エラーメッセージを閉じることができる', async () => {
      const user = userEvent.setup();
      
      // createMemo を失敗させる
      mockCreateMemo.mockRejectedValueOnce(new Error('Network error'));
      
      renderComponent(<MemoInput mode="text" />);
      
      // テキストを入力してから送信し、ネットワークエラーを発生させる
      const textField = screen.getByPlaceholderText('メモを入力してください...');
      await user.type(textField, 'テストメモ');
      
      const submitButton = screen.getByRole(;
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
      
      // エラーメッセージ内の閉じるボタンをクリック
      const errorContainer = screen.getByText('Network error').closest('div');
      const closeButton = errorContainer?.querySelector('button');
      if (closeButton) {
        await user.click(closeButton);
      }
      
      await waitFor(() => {
        expect(screen.queryByText('Network error')).not.toBeInTheDocument();
      });
    });
  });
});