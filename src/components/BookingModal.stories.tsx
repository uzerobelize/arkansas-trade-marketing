import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import { BookingModal } from "./BookingModal";

const meta = {
  title: "Components/BookingModal",
  component: BookingModal,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    initialStep: {
      control: { type: "select" },
      options: [1, 2, 3],
      description:
        "Initial step of the booking flow (1: Intake, 2: Calendar, 3: Confirmation)",
    },
    isOpen: {
      control: "boolean",
      description: "Controls modal visibility",
    },
  },
  args: {
    isOpen: true,
    initialStep: 1,
    onClose: () => console.log("onClose triggered"),
    onBookingComplete: (data) =>
      console.log("onBookingComplete triggered", data),
  },
} satisfies Meta<typeof BookingModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Mock Data ---
const MOCK_ISO_SLOTS = [
  "2026-10-21T14:00:00.000Z",
  "2026-10-21T14:30:00.000Z",
  "2026-10-21T15:00:00.000Z",
  "2026-10-21T16:00:00.000Z",
];

// --- Enhanced Mock Fetch Decorator ---
interface MockApiOptions {
  availabilityResponse?: () => Promise<Response>;
  bookingResponse?: () => Promise<Response>;
}

const withMockApi = (options: MockApiOptions = {}) => {
  const {
    availabilityResponse = () =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            date: "2026-10-21",
            timezone: "CST",
            availableSlots: MOCK_ISO_SLOTS,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    bookingResponse = () =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            message: "Booking confirmed",
            bookingId: 42,
            meetLink: "https://meet.google.com/abc-defg-hij",
            isDuplicate: false,
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        ),
      ),
  } = options;

  return (Story: React.ComponentType) => {
    useEffect(() => {
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : input.url;

        if (url.includes("/api/availability")) {
          return availabilityResponse();
        }

        if (url.includes("/api/bookings")) {
          return bookingResponse();
        }

        return originalFetch(input, init);
      };

      return () => {
        window.fetch = originalFetch;
      };
    }, []);

    return <Story />;
  };
};

/** Step 1: Intake Form with validation rules */
export const Step1Intake: Story = {
  args: {
    isOpen: true,
    initialStep: 1,
  },
};

/** Step 2: Live Slots Loaded & Ready to Reserve */
export const Step2CalendarSuccess: Story = {
  args: {
    isOpen: true,
    initialStep: 2,
  },
  decorators: [withMockApi()],
};

/** Step 2: Slot Conflict (409 Error when slot is taken mid-reservation) */
export const Step2BookingConflict409: Story = {
  args: {
    isOpen: true,
    initialStep: 2,
  },
  decorators: [
    withMockApi({
      bookingResponse: () =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              error:
                "This time slot is no longer available. Please select another.",
            }),
            { status: 409, headers: { "Content-Type": "application/json" } },
          ),
        ),
    }),
  ],
};

/** Step 2: Loading State during Google Calendar query */
export const Step2CalendarLoading: Story = {
  args: {
    isOpen: true,
    initialStep: 2,
  },
  decorators: [
    withMockApi({
      availabilityResponse: () => new Promise(() => {}), // Never resolves
    }),
  ],
};

/** Step 2: Empty Slots State */
export const Step2CalendarEmpty: Story = {
  args: {
    isOpen: true,
    initialStep: 2,
  },
  decorators: [
    withMockApi({
      availabilityResponse: () =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              date: "2026-10-21",
              timezone: "CST",
              availableSlots: [],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        ),
    }),
  ],
};

/** Step 3: Reservation Summary & Google Meet Link Display */
export const Step3Confirmation: Story = {
  args: {
    isOpen: true,
    initialStep: 3,
  },
};

/** Full Interactive End-to-End Demo */
export const FullInteractiveFlow: Story = {
  decorators: [withMockApi()],
  render: (args) => {
    const InteractiveWrapper = () => {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <div className="p-8 text-center">
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#F96E46] text-white font-extrabold shadow-md hover:bg-[#e25d36] transition-all cursor-pointer"
          >
            Launch Full Strategy Call Flow
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
