"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { submitBookingRequest, type BookingRequestState } from "@/app/actions";

type BookingRequestFormProps = {
  collectionName: string;
  collectionSlug: string;
  bookingDepositLabel?: string;
  bookingDepositUrl?: string;
};

const initialState: BookingRequestState = {
  status: "idle",
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="booking-form__submit" disabled={pending}>
      {pending ? "Sending request..." : "Send booking request"}
    </button>
  );
}

export function BookingRequestForm({
  collectionName,
  collectionSlug,
  bookingDepositLabel,
  bookingDepositUrl,
}: BookingRequestFormProps) {
  const [state, formAction] = useActionState(submitBookingRequest, initialState);

  return (
    <section className="booking-form-shell section-panel" id="booking">
      <div className="section-heading">
        <p className="section-label">Booking</p>
        <h2>Send the event details once, then keep the reply and payment flow simple.</h2>
        <p>
          Share the basics here and Dustin can follow up with timing, availability, and the right
          coverage package for your team.
        </p>
      </div>

      <div className="booking-form-layout">
        <div className="booking-form-card">
          <p className="photo-meta">Current collection</p>
          <p className="booking-form-card__title">{collectionName}</p>
          <p>
            Use this form for tournaments, team portraits, travel weekends, or gallery delivery
            questions tied to this collection.
          </p>
          {bookingDepositUrl ? (
            <a
              href={bookingDepositUrl}
              className="booking-form-card__payment"
              target="_blank"
              rel="noopener noreferrer"
            >
              {bookingDepositLabel ?? "Reserve coverage"}
            </a>
          ) : null}
        </div>

        <form action={formAction} className="booking-form">
          <input type="hidden" name="collectionSlug" value={collectionSlug} />

          <label>
            Contact name
            <input type="text" name="contactName" autoComplete="name" required />
          </label>
          <label>
            Email
            <input
              type="email"
              name="contactEmail"
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              spellCheck={false}
              required
            />
          </label>
          <label>
            Team or organization
            <input type="text" name="teamName" autoComplete="organization" />
          </label>
          <label>
            Event date
            <input type="date" name="eventDate" />
          </label>
          <label>
            Coverage type
            <select name="coverageType" defaultValue="Tournament coverage" required>
              <option>Tournament coverage</option>
              <option>Team portraits</option>
              <option>Season opener / senior night</option>
              <option>Travel weekend</option>
              <option>Gallery delivery question</option>
            </select>
          </label>
          <label>
            Event details
            <textarea
              name="message"
              rows={5}
              placeholder="Tell Dustin what you need, where the event is, and how quickly you need the gallery."
              required
            />
          </label>

          {state.message ? (
            <p
              className={`booking-form__status${
                state.status === "success" ? " booking-form__status--success" : " booking-form__status--error"
              }`}
              role="status"
              aria-live="polite"
            >
              {state.message}
            </p>
          ) : null}

          <SubmitButton />
        </form>
      </div>
    </section>
  );
}
