import type { NextFunction, Response, Request } from 'express';
import paymeErrors from '../integration/payme/constants/payme-errors';
import { configurations } from '../config';

const activatePaymeAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  const { id } = req.body;

  if (!token) {
    return res.status(200).json({
      id: id,
      error: {
        code: paymeErrors.OrderNotFound.code,
        message: paymeErrors.OrderNotFound.message,
      },
    });
  }

  const data = Buffer.from(token, 'base64').toString('utf8').split(':');
  const merchantKey = configurations.payme.merchantKey;

  if (!merchantKey) {
    return res.status(200).json({
      id: id,
      error: {
        code: paymeErrors.OrderNotFound.code,
        message: paymeErrors.OrderNotFound.message,
      },
    });
  }

  next();
};

export default activatePaymeAuth;
