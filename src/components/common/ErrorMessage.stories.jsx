import ErrorMessage from './ErrorMessage'

const meta: Meta<typeof ErrorMessage> = {
  title: 'Common/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['error', 'warning', 'info', 'success'],
      description: 'Alert severity level',
    },
    title: {
      control: 'text',
      description: 'Optional title for the alert',
    },
    message: {
      control: 'text',
      description: 'Main error message',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when close button is clicked',
    },
  },
  args: {
    onClose) => console.log('Alert closed'),
  },
}

export default meta
export const Error: Story = {
  args: {
    severity: 'error',
    message: 'An error occurred while processing your request.',
  },
}

export const ErrorWithTitle: Story = {
  args: {
    severity: 'error',
    title: 'Authentication Error',
    message: 'Invalid email or password. Please try again.',
  },
}

export const Warning: Story = {
  args: {
    severity: 'warning',
    title: 'Warning',
    message: 'This action cannot be undone.',
  },
}

export const Info: Story = {
  args: {
    severity: 'info',
    title: 'Information',
    message: 'Your data has been saved successfully.',
  },
}

export const Success: Story = {
  args: {
    severity: 'success',
    title: 'Success',
    message: 'Operation completed successfully!',
  },
}

export const WithoutCloseButton: Story = {
  args: {
    severity: 'error',
    message: 'This error cannot be dismissed.',
    onClose: undefined,
  },
}