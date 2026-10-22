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
  "2026-10-21T16:30:00.000Z",
  "2026-10-21T17:00:00.000Z",
  "2026-10-21T19:00:00.000Z",
  "2026-10-21T19:30:00.000Z",
];

// --- Helper Decorator for Mocking /api/availability Requests ---
const withMockFetch = (responseHandler: () => Promise<Response>) => {
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
          return responseHandler();
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

/** Step 1: Contractor Qualification Intake Form */
export const Step1Intake: Story = {
  args: {
    isOpen: true,
    initialStep: 1,
  },
};

/** Step 2: Live Slots Loaded (Success Response from Hono API) */
export const Step2CalendarSuccess: Story = {
  args: {
    isOpen: true,
    initialStep: 2,
  },
  decorators: [
    withMockFetch(() =>
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
    ),
  ],
};

/** Step 2: Loading Skeleton while querying Google Calendar */
export const Step2CalendarLoading: Story = {
  args: {
    isOpen: true,
    initialStep: 2,
  },
  decorators: [
    withMockFetch(
      () => new Promise(() => {}), // Never-resolving promise triggers loading state
    ),
  ],
};

/** Step 2: Empty State (No open slots available on selected date) */
export const Step2CalendarEmpty: Story = {
  args: {
    isOpen: true,
    initialStep: 2,
  },
  decorators: [
    withMockFetch(() =>
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
    ),
  ],
};

/** Step 2: Server/Network Error State with Retry Button */
export const Step2CalendarError: Story = {
  args: {
    isOpen: true,
    initialStep: 2,
  },
  decorators: [
    withMockFetch(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ error: "Failed to fetch availability" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        ),
      ),
    ),
  ],
};

/** Step 3: Reservation Summary & Confirmation Screen */
export const Step3Confirmation: Story = {
  args: {
    isOpen: true,
    initialStep: 3,
  },
};

/** Full Interactive Demo with API Mocking */
export const InteractiveDemo: Story = {
  decorators: [
    withMockFetch(() =>
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
    ),
  ],
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
