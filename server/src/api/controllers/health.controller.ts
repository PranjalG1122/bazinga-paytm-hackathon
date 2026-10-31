import { Request, Response } from 'express';
import { successResponse } from '../../utils/response.js';

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json(
    successResponse({
      status: 'ok',
      uptime: process.uptime(),
      service: 'bazinga-layered-backend',
    })
  );
}
