import LoadingSpinner from './LoadingSpinner'

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Common/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
}

export default meta
export const Default: Story = {
  args: {
    message: 'Loading...',
    size: 40,
  },
}