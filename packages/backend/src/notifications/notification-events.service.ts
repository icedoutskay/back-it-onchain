import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './notification.entity';

export interface MarketResolvedEvent {
  callId: number;
  callTitle: string;
  outcome: 'yes' | 'no';
  creatorWallet: string;
  stakers: Array<{ wallet: string; amount: string; choice: 'yes' | 'no' }>;
}

export interface StakeReceivedEvent {
  callId: number;
  callTitle: string;
  staker: string;
  amount: string;
  choice: 'yes' | 'no';
  creatorWallet: string;
}

export interface NewFollowerEvent {
  follower: string;
  followerHandle?: string;
  followerAvatar?: string;
  followedWallet: string;
}

@Injectable()
export class NotificationEventsService {
  constructor(
    private eventEmitter: EventEmitter2,
    private notificationsService: NotificationsService,
  ) {}

  // Event emitters
  emitMarketResolved(event: MarketResolvedEvent): void {
    this.eventEmitter.emit('market.resolved', event);
  }

  emitStakeReceived(event: StakeReceivedEvent): void {
    this.eventEmitter.emit('stake.received', event);
  }

  emitNewFollower(event: NewFollowerEvent): void {
    this.eventEmitter.emit('follower.new', event);
  }

  // Direct notification creation methods (for events that may not be emitted)
  async notifyMarketResolved(
    callId: number,
    callTitle: string,
    outcome: 'yes' | 'no',
    creatorWallet: string,
    stakers: Array<{ wallet: string; amount: string; choice: 'yes' | 'no' }>,
  ): Promise<void> {
    // Notify creator
    await this.notificationsService.create({
      recipientWallet: creatorWallet,
      type: NotificationType.MARKET_RESOLVED,
      payload: {
        callId,
        callTitle,
        outcome,
        totalParticipants: stakers.length,
      },
      resourceId: callId.toString(),
      resourceType: 'call',
    });

    // Notify all stakers
    for (const staker of stakers) {
      await this.notificationsService.create({
        recipientWallet: staker.wallet,
        type: NotificationType.MARKET_RESOLVED,
        payload: {
          callId,
          callTitle,
          outcome,
          userChoice: staker.choice,
          userAmount: staker.amount,
          userWon: staker.choice === outcome,
        },
        resourceId: callId.toString(),
        resourceType: 'call',
      });
    }
  }

  async notifyStakeReceived(
    callId: number,
    callTitle: string,
    staker: string,
    amount: string,
    choice: 'yes' | 'no',
    creatorWallet: string,
  ): Promise<void> {
    await this.notificationsService.create({
      recipientWallet: creatorWallet,
      type: NotificationType.STAKE_RECEIVED,
      payload: {
        callId,
        callTitle,
        staker,
        amount,
        choice,
      },
      resourceId: callId.toString(),
      resourceType: 'call',
    });
  }

  async notifyNewFollower(
    follower: string,
    followerHandle: string | undefined,
    followerAvatar: string | undefined,
    followedWallet: string,
  ): Promise<void> {
    await this.notificationsService.create({
      recipientWallet: followedWallet,
      type: NotificationType.NEW_FOLLOWER,
      payload: {
        follower,
        followerHandle,
        followerAvatar,
      },
      resourceId: follower,
      resourceType: 'user',
    });
  }
}
