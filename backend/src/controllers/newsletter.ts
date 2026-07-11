import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendPromotionalEmail } from '../services/emailService';

const prisma = new PrismaClient();

// POST /api/newsletter/subscribe
export const subscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    // @ts-ignore - bypassing cache issue during dev restart
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      // Return 200 so the frontend doesn't show a scary error for duplicate subscriptions
      return res.status(200).json({ message: 'Already subscribed!' });
    }

    // @ts-ignore
    await prisma.newsletterSubscriber.create({
      data: { email }
    });

    res.status(201).json({ message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    next(error);
  }
};

// POST /api/newsletter/send-promotion
export const sendPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required.' });
    }

    // Get all subscribers
    // @ts-ignore
    const subscribers = await prisma.newsletterSubscriber.findMany({
      select: { email: true }
    });

    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No subscribers found to send emails to.' });
    }

    const emails = subscribers.map((s: any) => s.email);

    // Send in batches of 50 to avoid SMTP connection limits
    const batchSize = 50;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await sendPromotionalEmail(batch, subject, content);
    }

    res.json({ message: `Successfully sent promotional email to ${emails.length} subscribers!` });
  } catch (error) {
    next(error);
  }
};
