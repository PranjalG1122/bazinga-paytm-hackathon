import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../app.js';
import { ApiErrorResponse } from '../../types/index.js';
import {
  AppError,
  BadRequestError,
  ValidationError,
  NotFoundError,
  ConfigurationError,
  SlackIntegrationError,
  TimeoutError,
} from '../../utils/errors.js';

describe('Error Handling and Custom Error Classes', () => {
  it('instantiates custom errors with correct status codes and codes', () => {
    const badReq = new BadRequestError('Bad input');
    assert.equal(badReq.statusCode, 400);
    assert.equal(badReq.code, 'BAD_REQUEST');
    assert.equal(badReq.name, 'BadRequestError');

    const validation = new ValidationError('Field missing');
    assert.equal(validation.statusCode, 400);
    assert.equal(validation.code, 'VALIDATION_ERROR');

    const notFound = new NotFoundError('Item missing');
    assert.equal(notFound.statusCode, 404);
    assert.equal(notFound.code, 'NOT_FOUND');

    const configErr = new ConfigurationError('Missing ENV');
    assert.equal(configErr.statusCode, 500);
    assert.equal(configErr.code, 'CONFIGURATION_ERROR');

    const slackErr = new SlackIntegrationError('API down');
    assert.equal(slackErr.statusCode, 502);
    assert.equal(slackErr.code, 'SLACK_INTEGRATION_ERROR');
    assert.match(slackErr.message, /\[Slack\] API down/);

    const timeoutErr = new TimeoutError('Slack timed out');
    assert.equal(timeoutErr.statusCode, 504);
    assert.equal(timeoutErr.code, 'TIMEOUT_ERROR');
  });

  it('handles 404 routes through custom NotFoundError without crashing', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as { port: number }).port;

    try {
      const response = await fetch(`http://localhost:${port}/non-existent-route`);
      const body = (await response.json()) as ApiErrorResponse;

      assert.equal(response.status, 404);
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'NOT_FOUND');
    } finally {
      server.close();
    }
  });

  it('handles response route validation error cleanly without crashing', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as { port: number }).port;

    try {
      const response = await fetch(`http://localhost:${port}/api/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = (await response.json()) as ApiErrorResponse;

      assert.equal(response.status, 400);
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    } finally {
      server.close();
    }
  });
});

