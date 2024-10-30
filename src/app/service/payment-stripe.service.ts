import { loadStripe } from '@stripe/stripe-js';
import { Injectable } from '@angular/core';
import { GenerellService } from './generell.service';

// Load Stripe outside of the component to ensure it's only loaded once
// const stripePromise = loadStripe('pk_test_YourPublishableKeyHere');
// const stripePromise = loadStripe('pk_live_51MhCdsHY2mPrPTHEjvOCMdhMgAO9004DSb1qHSoYlRj0AJJjAlo9fQsp2lUhbCyq9vNRk6p2aOOOXhuHpTe96civ00H3CoYWGy');
// const stripePromise = loadStripe('pk_live_51MhCdsHY2mPrPTHEjvOCMdhMgAO9004DSb1qHSoYlRj0AJJjAlo9fQsp2lUhbCyq9vNRk6p2aOOOXhuHpTe96civ00H3CoYWGy');
const stripePromise = loadStripe('pk_test_51MhCdsHY2mPrPTHEjdNTkPFA4UUgf4QCkUtldTr67koPu08NhcgvFL2TZ4r8ziWxzji0V0NKPvyVA5OU5b3TDppw00xJuA1tOL');

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private generellService: GenerellService) {}

  async redirectToStripeCheckout(amount: number, userId: string, username: string, isIos: boolean,isAndroid:boolean) {
    try {
      // Log the input parameters

      // Await the creation of the payment intent from your backend
      const session: any = await this.generellService.createPaymentIntent(
        { amountPayment: amount, userId: userId, username: username, isIos: isIos,isAndroid:isAndroid }).toPromise();
      if (!session || !session.id) {
        throw new Error('Invalid session returned from backend');
      }

      // Await the Stripe object
      const stripe: any = await stripePromise;

      // Check if stripe object is valid
      if (!stripe || typeof stripe.redirectToCheckout !== 'function') {
        throw new Error('Invalid Stripe object');
      }

      // Use Stripe's redirectToCheckout method
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      // Handle any errors here
      if (error) {
        console.error('Stripe redirectToCheckout error:', error.message);
      }
    } catch (err: any) {
      console.error('Error in redirectToStripeCheckout:', err.message, err.stack);
    }
  }

}
