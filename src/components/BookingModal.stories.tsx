import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { BookingModal } from "./BookingModal";

const meta = {
  title: 'Components/BookingModal',
  component: BookingModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    initialStep: {
      control: { type: 'select' },
      options: [1, 2, 3],
      description: 'Initial step of the booking flow (1: Intake, 2: Calendar, 3: Confirmation)',
    },
    isOpen: {
      control: 'boolean',
      description: 'Controls modal visibility',
    },
  },
  args: {
    isOpen: true,
    initialStep: 1,
    onClose: () => console.log("onClose"),
    onBookingComplete: () => console.log("onBookingComplete")
  },
} satisfies Meta<typeof BookingModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Step 1: Contractor Qualification Intake Form */
export const Step1Intake: Story = {
  args: {
    isOpen: true,
    initialStep: 1,
  },
};

/** Step 2: Interactive Month & Week Booking Calendar with 30-min time slots */
export const Step2Calendar: Story = {
  args: {
    isOpen: true,
    initialStep: 2,
  },
};

/** Step 3: Reservation Summary & Confirmation Screen */
export const Step3Confirmation: Story = {
  args: {
    isOpen: true,
    initialStep: 3,
  },
};

/** Modal in closed state */
export const Closed: Story = {
  args: {
    isOpen: false,
  },
};

/** Interactive Demo: Controls trigger button to open/close modal live */
export const InteractiveDemo: Story = {
  render: (args) => {
    const InteractiveWrapper = () => {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <div className="p-8 text-center">
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#F96E46] text-white font-extrabold shadow-md hover:bg-[#e25d36] transition-all cursor-pointer"
          >
            Open Booking Modal
          </button>
          <BookingModal
            {...args}
            isOpen={isOpen}
            onClose={() => {
              args.onClose();
              setIsOpen(false);
            }}
          />
        </div>
      );
    };

    return <InteractiveWrapper />;
  },
};
