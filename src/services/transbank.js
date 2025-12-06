// Transbank Payment Service
// Handles all Transbank Webpay Plus API calls via centralized Axios services

import { paymentService } from './api';

class TransbankService {
  // Initiate payment with Transbank
  async initiatePayment(shippingAddress) {
    return paymentService.initiatePayment(shippingAddress);
  }

  // Confirm payment after Transbank callback
  async confirmPayment(tokenWs) {
    return paymentService.confirmPayment(tokenWs);
  }

  // Get payment status
  async getPaymentStatus(orderId) {
    return paymentService.getPaymentStatus(orderId);
  }

  // Refund payment
  async refundPayment(orderId, amount = null) {
    return paymentService.refundPayment(orderId, amount);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Get stored payment data
  getStoredPaymentData() {
    try {
      const data = sessionStorage.getItem('paymentData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  // Store payment data
  storePaymentData(data) {
    try {
      sessionStorage.setItem('paymentData', JSON.stringify(data));
    } catch (error) {
      // Silently fail if storage is not available
    }
  }

  // Clear stored payment data
  clearStoredPaymentData() {
    sessionStorage.removeItem('paymentData');
  }
}

// Create and export singleton instance
const transbankService = new TransbankService();
export default transbankService;
