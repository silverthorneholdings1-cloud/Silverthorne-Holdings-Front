import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatApiError, contactService } from './api';
import axios from 'axios';

// Mock axios
vi.mock('axios');
vi.mock('../stores/routes', () => ({
  useRoutesStore: () => ({
    fullContactRoute: 'http://localhost:4005/api/contact'
  })
}));
vi.mock('../utils/logger.js', () => ({
  default: {
    error: vi.fn(),
    request: vi.fn(),
    response: vi.fn()
  }
}));

describe('formatApiError', () => {
  it('marks verification required responses and keeps message', () => {
    const apiError = {
      response: {
        status: 403,
        data: {
          error: 'Debes verificar tu cuenta antes de acceder a este recurso.',
          code: 'VERIFICATION_REQUIRED'
        }
      }
    };

    const result = formatApiError(apiError);

    expect(result).toMatchObject({
      error: 'Debes verificar tu cuenta antes de acceder a este recurso.',
      code: 'VERIFICATION_REQUIRED',
      verificationRequired: true,
      status: 403,
      statusCode: 403
    });
  });

  it('falls back to generic error message when response data is missing', () => {
    const err = new Error('Network down');
    const result = formatApiError(err);

    expect(result).toMatchObject({
      error: 'Network down',
      message: 'Network down',
      status: undefined,
      statusCode: undefined
    });
  });
});

describe('contactService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submitContactForm should send contact data successfully', async () => {
    const contactData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message.'
    };

    const mockResponse = {
      data: {
        success: true,
        message: 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.'
      }
    };

    axios.post = vi.fn().mockResolvedValue(mockResponse);

    const result = await contactService.submitContactForm(contactData);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:4005/api/contact',
      contactData
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('submitContactForm should handle network errors', async () => {
    const contactData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message.'
    };

    const networkError = new Error('Network Error');
    axios.post = vi.fn().mockRejectedValue(networkError);

    await expect(contactService.submitContactForm(contactData)).rejects.toThrow();
  });

  it('submitContactForm should handle API errors with response', async () => {
    const contactData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message.'
    };

    const apiError = {
      response: {
        status: 400,
        data: {
          success: false,
          error: 'El nombre debe tener entre 2 y 100 caracteres'
        }
      }
    };

    axios.post = vi.fn().mockRejectedValue(apiError);

    await expect(contactService.submitContactForm(contactData)).rejects.toMatchObject({
      error: 'El nombre debe tener entre 2 y 100 caracteres',
      status: 400
    });
  });

  it('submitContactForm should format data correctly', async () => {
    const contactData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message.'
    };

    const mockResponse = {
      data: {
        success: true,
        message: 'Mensaje enviado exitosamente.'
      }
    };

    axios.post = vi.fn().mockResolvedValue(mockResponse);

    await contactService.submitContactForm(contactData);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:4005/api/contact',
      expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.'
      })
    );
  });
});

