import { Inngest } from "inngest";
import User, { UserDataType } from "../models/user";
import Booking from "../models/booking";
import Show from "../models/show";
import sendEmail from "../configs/nodeMailer";
import { MovieType } from "../models/movie";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

//innngest functoijn to save user data to a database

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, img_url } = event.data;
    //now we will store it in the mongo db
    const userData: UserDataType = {
      _id: id,
      name: first_name + "" + last_name,
      email: email_addresses[0].email_address,
      image: img_url,
    };
    await User.create(userData);
  },
);

// inngest function to delete uesr from databse
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk", triggers: [{ event: "clerk/user.deleted" }] },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  },
);

// inngest function to update uesr from databse
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-with-clerk", triggers: [{ event: "clerk/user.updated" }] },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData: UserDataType = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };

    await User.findByIdAndUpdate(id, userData);
  },
);

//inngest function to cancel booking and release seats of show after 10 mins of booking created if payment not done

const releaseSeatsAndDeleteBooking = inngest.createFunction(
  {
    id: "release-seats-delete-booking",
    triggers: [{ event: "app/checkpayment" }],
  },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);

      //if payment is not made, release seats and delete booking
      if (!booking?.isPaid) {
        const show = await Show.findById(booking?.show);
        booking?.bookedSeats.forEach((seat) => {
          delete show?.occupiedSeats[seat];
        });
        show?.markModified("occupiedSeats");
        await show?.save();
        await Booking.findByIdAndDelete(booking?._id);
      }
    });
  },
);

//inngest functio to send email when user book seats

const sendBookingConfirmationEmail = inngest.createFunction(
  {
    id: "send-booking-confirmation-email",
    triggers: [{ event: "app/show.booked" }],
  },
  async ({ event, step }) => {
    const { bookingId } = event.data;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: {
          path: "movie",
          model: "Movie",
        },
      })
      .populate("user");

    const user = booking?.user as unknown as UserDataType;

    const show = booking?.show as any;

    const movie = show.movie as MovieType;

    await sendEmail({
      to: user.email,
      subject: `Payment Confirmation: "${movie.title}" booked`,
      body: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      
      <h2 style="color: #6C63FF;">
        Booking Confirmed 🎉
      </h2>

      <p>Hello ${user.name},</p>

      <p>
        Your booking for 
        <strong>${movie.title}</strong> 
        has been confirmed successfully.
      </p>

      <hr />

      <h3>Booking Details</h3>

      <p>
        <strong>Movie:</strong> ${movie.title}
      </p>

      <p>
        <strong>Seats:</strong> ${booking?.bookedSeats.join(", ")}
      </p>

      <p>
        <strong>Amount Paid:</strong> $${booking?.amount}
      </p>

      <p>
        <strong>Show Time:</strong> 
        ${new Date(show.showDateTime).toLocaleString()}
      </p>

      <br />

      <p>
        Enjoy your movie 🍿
      </p>

      <p>
        Team QuickShow
      </p>

    </div>
  `,
    });
  },
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
];
