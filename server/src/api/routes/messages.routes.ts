import { Router } from 'express';
import { translateIncoming, translateOutgoing } from '../controllers/messages.controller.js';

export const messagesRouter = Router();

messagesRouter.post('/incoming', translateIncoming);
messagesRouter.post('/outgoing', translateOutgoing);
