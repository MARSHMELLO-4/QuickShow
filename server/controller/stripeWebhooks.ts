import { Request, response, Response } from "express";
import Stripe from "stripe";
import Booking from "../models/booking";
import { err } from "inngest/types";
import { inngest } from "../inngest";

export const stripeWebhooks = async (req: Request, res: Response) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.json({
      success: false,
      message: "stripe secret key | Payment Issue",
    });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.json({
      success: false,
      message: "stripe webhook key | Payment Issue",
    });
  }

  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.json({
      success: false,
      message: "sig not defined",
    });
  }

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return response.status(400).send(`Webhook Error ${error.message}`);
    }
  }

  try {
    switch (event?.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });
        const session = sessionList.data[0];

        const bookingId = session.metadata?.bookingId;

        if (!bookingId) {
          break;
        }

        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: "",
        });

        //send confirmation email

        await inngest.send({ name: "app/show.booked", data: { bookingId } });

        break;
      }

      default:
        console.log("Unhandled Event Type : ", event?.type);
    }
    response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error : ", error);
    response.status(500).send("Internal Server Error");
  }
};
